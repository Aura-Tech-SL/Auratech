"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeData } from "@/lib/blocks/schemas";

interface CodeBlockProps {
  data: CodeData;
}

export function CodeBlock({ data }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="overflow-hidden rounded-xl border border-border bg-secondary">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {data.language || "plaintext"}
            </span>
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
                "font-mono text-xs text-muted-foreground",
                "transition-colors hover:bg-foreground/5 hover:text-foreground"
              )}
              aria-label="Copia el codi"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  Copiat
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copia
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 sm:p-6">
            <code className="font-mono text-sm leading-relaxed text-foreground">
              {data.code}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
