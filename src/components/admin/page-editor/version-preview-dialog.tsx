"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockSummary } from "./block-summary";

interface VersionSnapshotBlock {
  id?: string;
  type: string;
  order?: number;
  data?: Record<string, unknown>;
  isVisible?: boolean;
}

interface VersionSnapshot {
  title?: string;
  slug?: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  blocks?: VersionSnapshotBlock[];
}

export interface VersionDetail {
  id: string;
  version: number;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
  data: VersionSnapshot;
}

interface VersionPreviewDialogProps {
  pageId: string;
  versionId: string;
  onClose: () => void;
  onRestore: (snapshot: VersionSnapshot) => void;
}

export function VersionPreviewDialog({
  pageId,
  versionId,
  onClose,
  onRestore,
}: VersionPreviewDialogProps) {
  const [version, setVersion] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/pages/${pageId}/versions/${versionId}`)
      .then((r) => r.json())
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err);
        } else {
          setVersion(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Error carregant la versió");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, versionId]);

  function handleRestore() {
    if (!version) return;
    const ok = window.confirm(
      `Restaurar la versió ${version.version}? Substituirà els blocs actuals (no es desarà fins que premis "Desar").`,
    );
    if (!ok) return;
    onRestore(version.data);
    onClose();
  }

  const blocks = version?.data?.blocks ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              Historial · vista prèvia
            </p>
            <h2 className="text-lg font-light tracking-tight">
              {version
                ? `Versió ${version.version}`
                : loading
                ? "Carregant..."
                : "Versió"}
            </h2>
            {version && (
              <p className="mt-0.5 text-xs text-foreground/50">
                {new Date(version.createdAt).toLocaleString("ca-ES")} ·{" "}
                {version.createdBy.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={handleRestore}
              disabled={!version || loading}
              className="gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Tancar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
          )}
          {!loading && error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && version && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-secondary/20 px-4 py-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
                  Títol
                </p>
                <p className="mt-1 text-sm">{version.data.title || "(sense títol)"}</p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-foreground/40">
                  Blocs ({blocks.length})
                </p>
                {blocks.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-foreground/40">
                    Cap bloc
                  </p>
                ) : (
                  <div className="divide-y divide-border rounded-md border border-border">
                    {blocks.map((b, i) => (
                      <BlockSummary
                        key={b.id ?? `v_${i}`}
                        type={b.type}
                        data={(b.data as Record<string, unknown>) ?? {}}
                        isVisible={b.isVisible !== false}
                        isSelected={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
