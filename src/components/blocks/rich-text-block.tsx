import { cn } from "@/lib/utils";
import type { RichTextData } from "@/lib/blocks/schemas";

interface RichTextBlockProps {
  data: RichTextData;
}

export function RichTextBlock({ data }: RichTextBlockProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <div
          className={cn(
            "prose prose-invert max-w-none",
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
            "prose-p:text-muted-foreground prose-p:leading-relaxed",
            "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-foreground prose-strong:font-semibold",
            "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
            "prose-blockquote:border-accent prose-blockquote:text-muted-foreground",
            "prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-foreground",
            "prose-pre:bg-secondary prose-pre:rounded-lg",
            "prose-img:rounded-lg"
          )}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </section>
  );
}
