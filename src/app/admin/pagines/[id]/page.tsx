"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  X,
  Languages,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useVariantState } from "@/components/admin/page-editor/use-variant-state";
import { VariantColumn } from "@/components/admin/page-editor/variant-column";
import { InspectorSidebar } from "@/components/admin/page-editor/inspector-sidebar";

interface PageData {
  id: string;
  title: string;
  slug: string;
  locale: string;
  description: string | null;
  status: string;
  blocks: Array<{
    id: string;
    type: string;
    order: number;
    data: any;
    isVisible: boolean;
  }>;
  author: { id: string; name: string; email: string };
  updatedAt: string;
  publishedAt: string | null;
}

const ALL_LOCALES = ["ca", "en", "es"] as const;
const LOCALE_LABEL: Record<string, string> = {
  ca: "Català",
  en: "English",
  es: "Español",
};

export default function PageEditorPage() {
  const params = useParams();
  const pageId = params.id as string;

  const primary = useVariantState();
  const compare = useVariantState();

  const [page, setPage] = useState<PageData | null>(null);
  const [comparePost, setComparePost] = useState<PageData | null>(null);
  const [compareLocale, setCompareLocale] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  const [loading, setLoading] = useState(true);
  const [compareLoading, setCompareLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (!res.ok) throw new Error("Error carregant la pagina");
      const { data } = await res.json();
      setPage(data);
      primary.loadFromApi(data);
    } catch (err: any) {
      setError(err.message || "Error carregant");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Load the compare variant whenever the user picks one (or clear it).
  useEffect(() => {
    if (!compareLocale || !page) {
      setComparePost(null);
      compare.clear();
      return;
    }
    let cancelled = false;
    setCompareLoading(true);
    fetch(`/api/pages?slug=${encodeURIComponent(page.slug)}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (cancelled) return;
        const sibling = (data ?? []).find(
          (p: any) => p.locale === compareLocale,
        );
        if (sibling) {
          // Fetch full row by id to get blocks (the list endpoint doesn't include them)
          fetch(`/api/pages/${sibling.id}`)
            .then((r) => r.json())
            .then(({ data: full }) => {
              if (cancelled) return;
              setComparePost(full);
              compare.loadFromApi(full);
            });
        } else {
          // No sibling exists — set up an "empty" placeholder so the user
          // can copy from the primary side to bootstrap a translation.
          setComparePost(null);
          compare.clear();
          compare.setTitle(page.title); // hint
        }
      })
      .finally(() => {
        if (!cancelled) setCompareLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareLocale, page]);

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Primary
      await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: primary.title }),
      });
      const res = await fetch(`/api/pages/${pageId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: primary.blocks.map((b, i) => ({
            id: b.id,
            type: b.type,
            order: i,
            data: b.data,
            isVisible: b.isVisible,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error desant primari");
      }

      // Compare side: if the variant doesn't exist yet, create it first.
      if (compareLocale) {
        let compareId = comparePost?.id;
        if (!compareId) {
          const createRes = await fetch(`/api/pages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: compare.title || page.title,
              slug: page.slug,
              locale: compareLocale,
            }),
          });
          if (!createRes.ok) {
            const data = await createRes.json();
            throw new Error(data.error || "Error creant variant");
          }
          const { data: created } = await createRes.json();
          compareId = created.id;
          setComparePost(created);
        } else {
          await fetch(`/api/pages/${compareId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: compare.title }),
          });
        }

        if (compare.blocks.length > 0 && compareId) {
          const res2 = await fetch(`/api/pages/${compareId}/blocks`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blocks: compare.blocks.map((b, i) => ({
                id: b.id,
                type: b.type,
                order: i,
                data: b.data,
                isVisible: b.isVisible,
              })),
            }),
          });
          if (!res2.ok) {
            const data = await res2.json();
            throw new Error(data.error || "Error desant compare");
          }
        }
      }

      setSuccess("Canvis desats correctament");
      setTimeout(() => setSuccess(""), 3000);
      await loadPage();
    } catch (err: any) {
      setError(err.message || "Error desant");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!page) return;
    // Save first so the preview reflects the latest editor state.
    await handleSave();
    // Use the side that's currently active for the URL.
    const previewLocale =
      activeSide === "right" && compareLocale ? compareLocale : page.locale;
    const previewSlug =
      activeSide === "right" && comparePost ? comparePost.slug : page.slug;
    window.open(
      `/${previewLocale}/${previewSlug}?preview=admin`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handlePublish() {
    setPublishing(true);
    setError("");
    try {
      await handleSave();
      const res = await fetch(`/api/pages/${pageId}/publish`, { method: "PUT" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error publicant");
      }
      setSuccess("Pàgina publicada!");
      setTimeout(() => setSuccess(""), 3000);
      await loadPage();
    } catch (err: any) {
      setError(err.message || "Error publicant");
    } finally {
      setPublishing(false);
    }
  }

  function copyPrimaryToCompare() {
    compare.setTitle(primary.title);
    compare.setBlocksRaw(
      primary.blocks.map((b) => ({
        type: b.type,
        data: b.data,
        isVisible: b.isVisible,
      })),
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-24">
        <p className="text-foreground/50">Pagina no trobada</p>
        <Link href="/admin/pagines" className="mt-4 inline-block">
          <Button variant="outline">Tornar a pagines</Button>
        </Link>
      </div>
    );
  }

  const availableCompareLocales = ALL_LOCALES.filter((l) => l !== page.locale);

  // Inspector reads from active side. Block changes propagate via the active
  // side's updater so each variant stays independent.
  const inspectorBlock =
    activeSide === "left" ? primary.selectedBlock : compare.selectedBlock;
  const inspectorOnChange = (data: Record<string, unknown>) => {
    if (activeSide === "left" && primary.selectedBlock) {
      primary.updateBlockData(primary.selectedBlock._clientId, data);
    } else if (activeSide === "right" && compare.selectedBlock) {
      compare.updateBlockData(compare.selectedBlock._clientId, data);
    }
  };

  const documentTab = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Estat
        </label>
        <Badge
          variant={
            page.status === "PUBLISHED"
              ? "accent"
              : page.status === "DRAFT"
              ? "outline"
              : "secondary"
          }
        >
          {page.status === "PUBLISHED"
            ? "Publicat"
            : page.status === "DRAFT"
            ? "Esborrany"
            : "Arxivat"}
        </Badge>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Slug
        </label>
        <div className="text-sm font-mono text-foreground/70">/{page.slug}</div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Idioma actiu
        </label>
        <div className="text-sm text-foreground/70">
          {LOCALE_LABEL[page.locale]} ({page.locale.toUpperCase()})
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Comparar amb
        </label>
        <select
          value={compareLocale ?? ""}
          onChange={(e) => setCompareLocale(e.target.value || null)}
          className="w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <option value="">— Una sola variant —</option>
          {availableCompareLocales.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABEL[l]} ({l.toUpperCase()})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-foreground/40">
          Quan en seleccionis una, apareixerà al costat per editar les dues
          variants alhora.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Autor
        </label>
        <div className="text-sm text-foreground/70">{page.author.name}</div>
      </div>
      {page.publishedAt && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Publicat el
          </label>
          <div className="text-sm text-foreground/70 font-mono">
            {new Date(page.publishedAt).toISOString().slice(0, 10)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 min-h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/pagines">
            <Button variant="ghost" size="icon" aria-label="Tornar a Pàgines">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Editor de pàgina
            {compareLocale && (
              <>
                {" "}· {page.locale.toUpperCase()} ↔ {compareLocale.toUpperCase()}
                <Languages className="ml-1.5 inline h-3 w-3 align-text-bottom" />
              </>
            )}
            {!compareLocale && <> · {page.locale.toUpperCase()}</>}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            onClick={handlePreview}
            disabled={saving}
            className="gap-2"
            size="sm"
            title="Desa i obre vista prèvia en una pestanya nova"
          >
            <Eye className="h-4 w-4" />
            Vista prèvia
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
            size="sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Desar
          </Button>
          <Button
            variant="accent"
            onClick={handlePublish}
            disabled={publishing || saving}
            className="gap-2"
            size="sm"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publicar
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className="px-4 sm:px-6 lg:px-8 pt-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3 flex items-center justify-between">
              {error}
              <button
                onClick={() => setError("")}
                className="text-destructive/60 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-md px-4 py-3 flex items-center justify-between">
              {success}
              <button
                onClick={() => setSuccess("")}
                className="text-accent/60 hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 py-6 ${
          compareLocale
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]"
            : "lg:grid-cols-[minmax(0,1fr)_320px]"
        }`}
      >
        {/* Primary variant */}
        <div onClick={() => setActiveSide("left")}>
          <VariantColumn
            localeLabel={page.locale.toUpperCase()}
            title={primary.title}
            onTitleChange={primary.setTitle}
            pathHint={`/${page.locale}/${page.slug}`}
            blocks={primary.blocks}
            selectedClientId={
              activeSide === "left" ? primary.selectedClientId : null
            }
            onSelect={(id) => {
              setActiveSide("left");
              primary.setSelectedClientId(id);
              compare.setSelectedClientId(null);
            }}
            onChange={primary.updateBlockData}
            onReorder={primary.reorderBlocks}
            onToggleVisibility={primary.toggleVisibility}
            onDelete={primary.removeBlock}
            onDuplicate={primary.duplicateBlock}
            onInsert={primary.insertBlockAt}
          />
        </div>

        {/* Compare variant */}
        {compareLocale && (
          <div onClick={() => setActiveSide("right")}>
            {compareLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-foreground/30" />
              </div>
            ) : (
              <VariantColumn
                localeLabel={compareLocale.toUpperCase()}
                title={compare.title}
                onTitleChange={compare.setTitle}
                pathHint={
                  comparePost
                    ? `/${compareLocale}/${comparePost.slug}`
                    : `(no existeix; es crearà al desar)`
                }
                statusBadge={
                  !comparePost ? (
                    <Badge variant="outline" className="text-[10px]">
                      Variant nova
                    </Badge>
                  ) : null
                }
                blocks={compare.blocks}
                selectedClientId={
                  activeSide === "right" ? compare.selectedClientId : null
                }
                onSelect={(id) => {
                  setActiveSide("right");
                  compare.setSelectedClientId(id);
                  primary.setSelectedClientId(null);
                }}
                onChange={compare.updateBlockData}
                onReorder={compare.reorderBlocks}
                onToggleVisibility={compare.toggleVisibility}
                onDelete={compare.removeBlock}
                onDuplicate={compare.duplicateBlock}
                onInsert={compare.insertBlockAt}
                onCopyFromOther={copyPrimaryToCompare}
                copyFromLabel={page.locale}
              />
            )}
          </div>
        )}

        <div className="hidden lg:block">
          <InspectorSidebar
            documentTab={documentTab}
            selectedBlock={
              inspectorBlock
                ? {
                    type: inspectorBlock.type,
                    data: inspectorBlock.data,
                    onChange: inspectorOnChange,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
