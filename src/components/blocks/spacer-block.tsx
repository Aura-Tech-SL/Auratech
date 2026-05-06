import { cn } from "@/lib/utils";
import type { SpacerData } from "@/lib/blocks/schemas";

interface SpacerBlockProps {
  data: SpacerData;
}

const heightMap: Record<string, string> = {
  sm: "h-8 sm:h-12",
  md: "h-16 sm:h-24",
  lg: "h-24 sm:h-36",
  xl: "h-36 sm:h-48",
};

export function SpacerBlock({ data }: SpacerBlockProps) {
  const height = data.height ?? "md";

  return <div className={cn(heightMap[height] || heightMap.md)} aria-hidden="true" />;
}
