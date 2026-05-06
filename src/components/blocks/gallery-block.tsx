import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryData } from "@/lib/blocks/schemas";

interface GalleryBlockProps {
  data: GalleryData;
}

export function GalleryBlock({ data }: GalleryBlockProps) {
  const columns = data.columns ?? 3;

  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className={cn("grid gap-4", gridCols[columns] || gridCols[3])}>
          {data.images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
            >
              <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.round(100 / columns)}vw`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
