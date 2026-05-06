import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ImageData } from "@/lib/blocks/schemas";

interface ImageBlockProps {
  data: ImageData;
}

export function ImageBlock({ data }: ImageBlockProps) {
  return (
    <section className="py-16 sm:py-20">
      <div
        className={cn(
          "mx-auto px-4",
          data.fullWidth ? "max-w-full px-0" : "container max-w-4xl"
        )}
      >
        <figure>
          <div
            className={cn(
              "relative overflow-hidden",
              !data.fullWidth && "rounded-lg"
            )}
          >
            <Image
              src={data.src}
              alt={data.alt || ""}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              sizes={data.fullWidth ? "100vw" : "(max-width: 896px) 100vw, 896px"}
            />
          </div>
          {data.caption && (
            <figcaption className="mt-3 text-center font-mono text-sm text-muted-foreground">
              {data.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
