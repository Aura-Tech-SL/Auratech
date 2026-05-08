"use client";

import { useState } from "react";
import { ImageIcon, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";

const TITLE_MAX = 60;
const DESC_MAX = 160;

export interface SeoFields {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface SEOPanelProps {
  value: SeoFields;
  onChange: (next: SeoFields) => void;
  /** Used in the Google preview snippet (defaults to "auratech.cat"). */
  domain?: string;
  /** Path part of the live URL (e.g. "/labs", "/blog/article-slug"). */
  pathHint?: string;
  /** Fallbacks shown in the preview when the SEO fields are empty. */
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function SEOPanel({
  value,
  onChange,
  domain = "auratech.cat",
  pathHint = "/",
  fallbackTitle,
  fallbackDescription,
}: SEOPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const titleLen = value.metaTitle.length;
  const descLen = value.metaDescription.length;

  const previewTitle = value.metaTitle || fallbackTitle || "Títol de la pàgina";
  const previewDesc =
    value.metaDescription ||
    fallbackDescription ||
    "Descripció breu que apareixerà als resultats de cerca.";

  function update<K extends keyof SeoFields>(key: K, v: SeoFields[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Meta title
          </label>
          <CharCount current={titleLen} max={TITLE_MAX} />
        </div>
        <Input
          value={value.metaTitle}
          onChange={(e) => update("metaTitle", e.target.value)}
          placeholder={fallbackTitle ?? "Títol per a Google"}
          className="h-8 text-sm"
        />
        <p className="text-[10px] text-foreground/40">
          Si està buit, s&apos;usa el títol del document.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Meta description
          </label>
          <CharCount current={descLen} max={DESC_MAX} />
        </div>
        <Textarea
          value={value.metaDescription}
          onChange={(e) => update("metaDescription", e.target.value)}
          rows={3}
          placeholder="Resum breu que apareixerà als resultats de cerca."
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Open Graph image (URL)
        </label>
        <div className="flex gap-2">
          <Input
            value={value.ogImage}
            onChange={(e) => update("ogImage", e.target.value)}
            placeholder="/uploads/og-image.jpg"
            className="h-8 flex-1 text-sm font-mono"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="h-8 gap-1.5"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Galeria
          </Button>
        </div>
        {value.ogImage && (
          <div className="relative mt-2 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.ogImage}
              alt="OG preview"
              className="aspect-[1200/630] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => update("ogImage", "")}
              className="absolute right-2 top-2 rounded-md border border-border bg-background/80 p-1 text-foreground/70 backdrop-blur-sm hover:text-foreground"
              aria-label="Treure imatge OG"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <p className="text-[10px] text-foreground/40">
          Recomanat 1200×630px. Si està buit es genera automàticament a
          /api/og.
        </p>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-foreground/40" />
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Vista prèvia Google
          </label>
        </div>
        <div className="rounded-md border border-border bg-secondary/20 px-4 py-3">
          <p className="truncate text-[11px] text-foreground/50">
            {domain}
            {pathHint}
          </p>
          <p className="mt-0.5 truncate text-[15px] text-accent/90 leading-snug">
            {previewTitle}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-foreground/60 line-clamp-2">
            {previewDesc}
          </p>
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          mimePrefix="image/"
          onClose={() => setPickerOpen(false)}
          onSelect={(item) => {
            update("ogImage", item.url);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  const over = current > max;
  const close = !over && current > max * 0.85;
  return (
    <span
      className={`font-mono text-[10px] tabular-nums ${
        over
          ? "text-destructive"
          : close
          ? "text-amber-500/80"
          : "text-foreground/40"
      }`}
    >
      {current}/{max}
    </span>
  );
}
