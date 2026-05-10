import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { detectFileType } from "@/lib/file-type";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE_IMAGE_OR_PDF = 10 * 1024 * 1024; // 10 MB
const MAX_SIZE_VIDEO = 50 * 1024 * 1024; // 50 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Allowlist of MIME types we accept. SVG is intentionally excluded — its XML
// payload can carry executable scripts that run when the browser renders the
// file inline. See openspec/changes/archive/2026-05-06-security-week-1/design.md §4.
const ALLOWED_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
]);

const UPLOAD_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"];

function maxSizeFor(mime: string): number {
  return mime.startsWith("video/") ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE_OR_PDF;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
    }
    const role = session.user.role;
    if (!role || !UPLOAD_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "/";

    if (!files.length) {
      return NextResponse.json({ error: "Cap fitxer proporcionat" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      // 1. Reject if the declared MIME isn't on the allowlist.
      if (!ALLOWED_MIMES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Tipus de fitxer no acceptat per "${file.name}". Tipus permesos: jpg, png, webp, gif, pdf, mp4, webm.`,
          },
          { status: 400 },
        );
      }

      // 2. Reject oversize.
      const limit = maxSizeFor(file.type);
      if (file.size > limit) {
        const limitMb = Math.floor(limit / (1024 * 1024));
        return NextResponse.json(
          { error: `El fitxer "${file.name}" supera la mida màxima de ${limitMb}MB` },
          { status: 400 },
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Magic-byte check. Prevents a `.php` file declared as `image/jpeg`
      //    from sneaking through.
      const detected = detectFileType(buffer.subarray(0, 4096));
      if (!detected) {
        return NextResponse.json(
          { error: `No s'ha pogut identificar el contingut de "${file.name}"` },
          { status: 400 },
        );
      }
      if (detected !== file.type) {
        return NextResponse.json(
          {
            error: `El contingut del fitxer "${file.name}" no coincideix amb el tipus declarat`,
          },
          { status: 400 },
        );
      }

      const timestamp = Date.now();
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-");
      const filename = `${timestamp}-${safeName}`;

      const uploadPath = path.join(UPLOAD_DIR, folder);
      await mkdir(uploadPath, { recursive: true });
      await writeFile(path.join(uploadPath, filename), buffer);

      const url = `/uploads${folder === "/" ? "/" : `/${folder}/`}${filename}`.replace(
        /\/+/g,
        "/",
      );

      const media = await prisma.media.create({
        data: {
          url,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          folder,
          uploadedById: session.user.id,
        },
      });

      results.push(media);
    }

    return NextResponse.json({ data: results }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
