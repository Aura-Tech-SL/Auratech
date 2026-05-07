"use client";

import dynamic from "next/dynamic";
import DOMPurify from "isomorphic-dompurify";
import { BlockSummary } from "./block-summary";

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <SummaryFallback /> },
);

function SummaryFallback() {
  return (
    <div className="px-4 py-3.5 text-xs text-foreground/40">Carregant editor...</div>
  );
}

interface CanvasBlockBodyProps {
  type: string;
  data: Record<string, unknown>;
  isVisible: boolean;
  isSelected: boolean;
  onChange: (data: Record<string, unknown>) => void;
}

/**
 * What renders inside each block on the canvas. For block types we can edit
 * inline (rich-text, today), the editor renders directly here. For others,
 * we show a read-only summary card and the actual editing happens in the
 * inspector sidebar. This is the WP-Gutenberg-style hybrid: text edits in
 * place, structural blocks edit in the inspector.
 */
export function CanvasBlockBody({
  type,
  data,
  isVisible,
  isSelected,
  onChange,
}: CanvasBlockBodyProps) {
  if (type === "rich-text") {
    if (isSelected) {
      return (
        <div className="px-1 py-1">
          <RichTextEditor
            value={(data.content as string) ?? ""}
            onChange={(html) => onChange({ ...data, content: html })}
            placeholder="Escriu aquí. Cmd+B per negreta, Cmd+I per cursiva..."
          />
        </div>
      );
    }
    // Read-only preview while not selected — render the actual formatted HTML
    // so the canvas reads visually like the published page.
    const html = (data.content as string) ?? "";
    if (!html) {
      return (
        <div className="px-4 py-6 text-center text-xs italic text-foreground/30">
          (text buit — clica per començar a escriure)
        </div>
      );
    }
    const sanitized = DOMPurify.sanitize(html);
    return (
      <div
        className={`px-5 py-4 prose prose-invert prose-sm max-w-none
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
          prose-h2:text-xl prose-h3:text-lg
          prose-p:text-foreground/80 prose-p:leading-relaxed
          prose-a:text-accent
          prose-strong:text-foreground
          prose-blockquote:border-accent prose-blockquote:text-foreground/70
          prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5
          prose-hr:border-border ${!isVisible ? "opacity-50" : ""}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // All other block types show the summary card. Their editing happens in
  // the inspector sidebar's "Bloc" tab.
  return (
    <BlockSummary
      type={type}
      data={data}
      isVisible={isVisible}
      isSelected={isSelected}
    />
  );
}
