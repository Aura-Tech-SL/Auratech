"use client";

import { useEffect, useState, useCallback } from "react";
import { History, Loader2 } from "lucide-react";
import { VersionPreviewDialog } from "./version-preview-dialog";

interface VersionListItem {
  id: string;
  version: number;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
}

interface VersionSnapshot {
  title?: string;
  blocks?: Array<{
    type: string;
    data?: Record<string, unknown>;
    isVisible?: boolean;
  }>;
}

interface VersionHistoryProps {
  /** Base URL of the versions endpoint, e.g. "/api/pages/<id>/versions". */
  apiBase: string;
  /**
   * Bumped by the parent after a publish so the list refetches and shows the
   * new version without a full page reload.
   */
  refreshKey?: number;
  onRestore: (snapshot: VersionSnapshot) => void;
}

export function VersionHistory({
  apiBase,
  refreshKey,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openVersionId, setOpenVersionId] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetch(apiBase)
      .then((r) => r.json())
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err);
        else setVersions(data);
      })
      .catch(() => {
        if (!cancelled) setError("Error carregant historial");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    return load();
  }, [load, refreshKey]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-foreground/40" />
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Historial
        </label>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-foreground/40">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregant...
        </div>
      )}

      {!loading && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {!loading && !error && versions && versions.length === 0 && (
        <p className="text-xs text-foreground/40">
          Encara no hi ha versions. Es genera una cada cop que publiques.
        </p>
      )}

      {!loading && !error && versions && versions.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border">
          {versions.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setOpenVersionId(v.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/[0.06]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono text-foreground/80">
                    v{v.version}
                  </p>
                  <p className="truncate text-[11px] text-foreground/50">
                    {new Date(v.createdAt).toLocaleString("ca-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {v.createdBy.name}
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent/70">
                  Veure
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {openVersionId && (
        <VersionPreviewDialog
          apiBase={apiBase}
          versionId={openVersionId}
          onClose={() => setOpenVersionId(null)}
          onRestore={onRestore}
        />
      )}
    </div>
  );
}
