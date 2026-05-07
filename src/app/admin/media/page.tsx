export const dynamic = "force-dynamic";

import Image from "next/image";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, FileText, Film } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaUploader } from "@/components/admin/media-uploader";

function fileIcon(mime: string) {
  if (mime.startsWith("image/"))
    return <ImageIcon className="h-8 w-8 text-foreground/30" />;
  if (mime.startsWith("video/"))
    return <Film className="h-8 w-8 text-foreground/30" />;
  return <FileText className="h-8 w-8 text-foreground/30" />;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default async function AdminMediaPage() {
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Admin · Recursos"
        title="Media"
        description="Imatges, vídeos i PDFs pujats des de l'admin. Allotjats a /public/uploads."
        icon={<ImageIcon className="h-7 w-7 text-foreground/40" />}
        action={<MediaUploader />}
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/50 text-lg">Encara no hi ha fitxers</p>
            <p className="text-foreground/30 text-sm mt-1 max-w-sm mx-auto">
              Puja la primera imatge, vídeo o document amb el botó de dalt. Tipus
              acceptats: jpg, png, webp, gif, pdf, mp4, webm.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((m) => {
            const isImage = m.mimeType.startsWith("image/");
            return (
              <Card
                key={m.id}
                className="overflow-hidden hover:border-accent/30 transition-colors"
              >
                <div className="aspect-square bg-secondary/30 flex items-center justify-center relative">
                  {isImage ? (
                    <Image
                      src={m.url}
                      alt={m.alt || m.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    fileIcon(m.mimeType)
                  )}
                </div>
                <CardContent className="p-3 space-y-1">
                  <p
                    className="text-xs font-mono truncate text-foreground/80"
                    title={m.filename}
                  >
                    {m.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-foreground/40">
                    <span className="font-mono">{humanSize(m.size)}</span>
                    <span>{formatDate(m.createdAt)}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {m.mimeType.split("/")[1]}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
