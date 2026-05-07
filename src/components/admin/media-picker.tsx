"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X, Search, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  size: number;
  mimeType: string;
}

interface MediaPickerProps {
  /** Called with the selected media URL when the user picks one. */
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
  /** Filter results to a MIME prefix (e.g. "image/"). */
  mimePrefix?: string;
}

export function MediaPicker({
  onSelect,
  onClose,
  mimePrefix = "image/",
}: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/media?mimeType=${encodeURIComponent(mimePrefix)}&limit=60`,
      );
      const { data } = await res.json();
      setItems(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mimePrefix]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      fd.append("folder", "/");
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      // Auto-select the first uploaded item.
      const created = json.data?.[0];
      if (created) {
        onSelect(created);
        return;
      }
      await load();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const filtered = filter
    ? items.filter((m) =>
        m.filename.toLowerCase().includes(filter.toLowerCase()),
      )
    : items;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              Inserir imatge
            </p>
            <h2 className="text-lg font-light tracking-tight">Media library</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            <Button
              variant="accent"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Pujant..." : "Pujar nova"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Tancar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative border-b border-border px-5 py-3">
          <Search className="absolute left-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtra per nom de fitxer..."
            className="h-8 pl-8 text-sm"
          />
          {uploadError && (
            <p className="mt-2 text-xs text-destructive">{uploadError}</p>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ImageIcon className="mb-3 h-12 w-12 text-foreground/20" />
              <p className="text-sm text-foreground/50">
                {filter ? "Cap fitxer coincideix" : "Encara no hi ha fitxers"}
              </p>
              {!filter && (
                <p className="mt-1 text-xs text-foreground/30">
                  Puja la primera imatge amb el botó de dalt
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group flex flex-col gap-1 overflow-hidden rounded-md border border-border bg-secondary/30 p-1 text-left transition-all",
                    "hover:border-accent/40 hover:ring-1 hover:ring-accent/20",
                  )}
                >
                  <div className="relative aspect-square overflow-hidden rounded bg-secondary/50">
                    <Image
                      src={item.url}
                      alt={item.alt || item.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p
                    className="truncate px-1 text-[10px] font-mono text-foreground/60"
                    title={item.filename}
                  >
                    {item.filename}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
