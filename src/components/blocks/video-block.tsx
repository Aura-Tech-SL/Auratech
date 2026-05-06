"use client";

import { cn } from "@/lib/utils";
import type { VideoData } from "@/lib/blocks/schemas";

interface VideoBlockProps {
  data: VideoData;
}

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "html5"; embedUrl: string } {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { type: "html5", embedUrl: url };
}

export function VideoBlock({ data }: VideoBlockProps) {
  const { type, embedUrl } = getEmbedUrl(data.url);

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {data.title && (
          <h3 className="mb-6 text-center font-mono text-sm uppercase tracking-wider text-muted-foreground">
            {data.title}
          </h3>
        )}

        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border bg-secondary",
            type !== "html5" && "aspect-video"
          )}
        >
          {type === "html5" ? (
            <video
              src={embedUrl}
              controls
              autoPlay={data.autoplay}
              className="h-auto w-full"
              playsInline
            >
              El teu navegador no admet la reproducció de vídeo.
            </video>
          ) : (
            <iframe
              src={`${embedUrl}${data.autoplay ? "?autoplay=1" : ""}`}
              title={data.title || "Vídeo incrustat"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
      </div>
    </section>
  );
}
