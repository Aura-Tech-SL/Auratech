import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "/";

    if (!files.length) {
      return NextResponse.json({ error: "Cap fitxer proporcionat" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `El fitxer "${file.name}" supera els 10MB` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-");
      const filename = `${timestamp}-${safeName}`;

      const uploadPath = path.join(UPLOAD_DIR, folder);
      await mkdir(uploadPath, { recursive: true });
      await writeFile(path.join(uploadPath, filename), buffer);

      const url = `/uploads${folder === "/" ? "/" : `/${folder}/`}${filename}`.replace(/\/+/g, "/");

      const media = await prisma.media.create({
        data: {
          url,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          folder,
          uploadedById: (session!.user as any).id,
        },
      });

      results.push(media);
    }

    return NextResponse.json({ data: results }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}
