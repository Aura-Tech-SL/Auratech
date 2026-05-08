"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, Send, X, Languages, Eye } from "lucide-react";
import Link from "next/link";
import { useVariantState } from "@/components/admin/page-editor/use-variant-state";
import { VariantColumn } from "@/components/admin/page-editor/variant-column";
import { InspectorSidebar } from "@/components/admin/page-editor/inspector-sidebar";
import { SEOPanel, type SeoFields } from "@/components/admin/page-editor/seo-panel";
import { ScheduleControls } from "@/components/admin/page-editor/schedule-controls";
import { VersionHistory } from "@/components/admin/page-editor/version-history";

interface PostData {
  id: string;
  title: string;
  slug: string;
  locale: string;
  excerpt: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  category: string;
  tags: string[];
  status: string;
  translationKey: string | null;
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
  publishAt: string | null;
}

interface PostMeta {
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string;
}

const ALL_LOCALES = ["ca", "en", "es"] as const;
const LOCALE_LABEL: Record<string, string> = {
  ca: "Català",
  en: "English",
  es: "Español",
};
const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "IOT", label: "IoT" },
  { value: "CLOUD", label: "Cloud" },
  { value: "STRATEGY", label: "Estratègia" },
];

const emptyMeta: PostMeta = {
  excerpt: "",
  coverImage: "",
  category: "GENERAL",
  tags: "",
};

function metaFromPost(p: PostData): PostMeta {
  return {
    excerpt: p.excerpt,
    coverImage: p.coverImage ?? "",
    category: p.category,
    tags: (p.tags ?? []).join(", "),
  };
}

const emptySeo: SeoFields = { metaTitle: "", metaDescription: "", ogImage: "" };

function seoFromPost(p: PostData): SeoFields {
  return {
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    ogImage: p.ogImage ?? "",
  };
}

export default function BlogPostEditorPage() {
  const params = useParams();
  const postId = params.id as string;

  const primary = useVariantState();
  const compare = useVariantState();

  const [post, setPost] = useState<PostData | null>(null);
  const [comparePost, setComparePost] = useState<PostData | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PostMeta>(emptyMeta);
  const [compareMeta, setCompareMeta] = useState<PostMeta>(emptyMeta);
  const [primarySeo, setPrimarySeo] = useState<SeoFields>(emptySeo);
  const [compareSeo, setCompareSeo] = useState<SeoFields>(emptySeo);
  const [compareLocale, setCompareLocale] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  const [loading, setLoading] = useState(true);
  const [compareLoading, setCompareLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versionsKey, setVersionsKey] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${postId}`);
      if (!res.ok) throw new Error("Error carregant l'article");
      const { data } = await res.json();
      setPost(data);
      setPrimaryMeta(metaFromPost(data));
      setPrimarySeo(seoFromPost(data));
      primary.loadFromApi(data);
    } catch (err: any) {
      setError(err.message || "Error carregant");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!compareLocale || !post) {
      setComparePost(null);
      setCompareMeta(emptyMeta);
      setCompareSeo(emptySeo);
      compare.clear();
      return;
    }
    if (!post.translationKey) {
      // Without a translationKey, we can't reliably link locale variants.
      // Treat compare as a brand-new variant. The user can copy from primary.
      setComparePost(null);
      setCompareMeta(emptyMeta);
      setCompareSeo(emptySeo);
      compare.clear();
      compare.setTitle(post.title);
      return;
    }
    let cancelled = false;
    setCompareLoading(true);
    fetch(
      `/api/blog?translationKey=${encodeURIComponent(post.translationKey)}`,
    )
      .then((r) => r.json())
      .then(({ data }) => {
        if (cancelled) return;
        const sibling = (data ?? []).find(
          (p: any) => p.locale === compareLocale,
        );
        if (sibling) {
          fetch(`/api/blog/${sibling.id}`)
            .then((r) => r.json())
            .then(({ data: full }) => {
              if (cancelled) return;
              setComparePost(full);
              setCompareMeta(metaFromPost(full));
              setCompareSeo(seoFromPost(full));
              compare.loadFromApi(full);
            });
        } else {
          setComparePost(null);
          setCompareMeta(emptyMeta);
          setCompareSeo(emptySeo);
          compare.clear();
          compare.setTitle(post.title);
        }
      })
      .finally(() => {
        if (!cancelled) setCompareLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareLocale, post]);

  function copyPrimaryToCompare() {
    compare.setTitle(primary.title);
    compare.setBlocksRaw(
      primary.blocks.map((b) => ({
        type: b.type,
        data: b.data,
        isVisible: b.isVisible,
      })),
    );
    setCompareMeta({
      ...primaryMeta,
      excerpt: primaryMeta.excerpt,
    });
  }

  async function saveOneSide(opts: {
    id?: string;
    title: string;
    meta: PostMeta;
    seo: SeoFields;
    blocks: typeof primary.blocks;
    locale: string;
    translationKey?: string | null;
  }): Promise<string> {
    const tagsArray = opts.meta.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let id = opts.id;
    if (!id) {
      // Create the variant. /api/blog POST may not yet accept translationKey;
      // server can fall back to setting it via subsequent PUT if needed.
      const createRes = await fetch(`/api/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: opts.title,
          excerpt: opts.meta.excerpt || "(buit)",
          coverImage: opts.meta.coverImage || null,
          metaTitle: opts.seo.metaTitle || null,
          metaDescription: opts.seo.metaDescription || null,
          ogImage: opts.seo.ogImage || null,
          category: opts.meta.category,
          tags: tagsArray,
          locale: opts.locale,
          translationKey: opts.translationKey ?? null,
        }),
      });
      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Error creant variant");
      }
      const { data: created } = await createRes.json();
      id = created.id;
    } else {
      const metaRes = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: opts.title,
          excerpt: opts.meta.excerpt,
          coverImage: opts.meta.coverImage || null,
          metaTitle: opts.seo.metaTitle || null,
          metaDescription: opts.seo.metaDescription || null,
          ogImage: opts.seo.ogImage || null,
          category: opts.meta.category,
          tags: tagsArray,
        }),
      });
      if (!metaRes.ok) {
        const data = await metaRes.json();
        throw new Error(data.error || "Error desant metadades");
      }
    }

    if (opts.blocks.length > 0) {
      const blocksRes = await fetch(`/api/blog/${id}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: opts.blocks.map((b, i) => ({
            id: b.id,
            type: b.type,
            order: i,
            data: b.data,
            isVisible: b.isVisible,
          })),
        }),
      });
      if (!blocksRes.ok) {
        const data = await blocksRes.json();
        throw new Error(data.error || "Error desant blocs");
      }
    }
    return id!;
  }

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveOneSide({
        id: post.id,
        title: primary.title,
        meta: primaryMeta,
        seo: primarySeo,
        blocks: primary.blocks,
        locale: post.locale,
        translationKey: post.translationKey,
      });

      if (compareLocale) {
        await saveOneSide({
          id: comparePost?.id,
          title: compare.title || primary.title,
          meta: compareMeta,
          seo: compareSeo,
          blocks: compare.blocks,
          locale: compareLocale,
          translationKey: post.translationKey,
        });
      }

      setSuccess("Canvis desats correctament");
      setTimeout(() => setSuccess(""), 3000);
      await loadPost();
    } catch (err: any) {
      setError(err.message || "Error desant");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!post) return;
    await handleSave();
    const previewLocale =
      activeSide === "right" && compareLocale ? compareLocale : post.locale;
    const previewSlug =
      activeSide === "right" && comparePost ? comparePost.slug : post.slug;
    window.open(
      `/${previewLocale}/blog/${previewSlug}?preview=admin`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handlePublish() {
    setPublishing(true);
    setError("");
    try {
      await handleSave();
      const res = await fetch(`/api/blog/${postId}/publish`, { method: "PUT" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error publicant");
      }
      setSuccess("Article publicat!");
      setTimeout(() => setSuccess(""), 3000);
      setVersionsKey((k) => k + 1);
      await loadPost();
    } catch (err: any) {
      setError(err.message || "Error publicant");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSchedule(when: Date) {
    if (!activeSidePost) return;
    setError("");
    await handleSave();
    const res = await fetch(`/api/blog/${activeSidePost.id}/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishAt: when.toISOString() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error programant");
    }
    setSuccess(`Publicació programada per al ${when.toLocaleString("ca-ES")}`);
    setTimeout(() => setSuccess(""), 4000);
    await loadPost();
  }

  function handleRestoreVersion(snapshot: {
    title?: string;
    excerpt?: string;
    coverImage?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    tags?: string[];
    category?: string;
    blocks?: Array<{ type: string; data?: Record<string, unknown>; isVisible?: boolean }>;
  }) {
    if (snapshot.title !== undefined) primary.setTitle(snapshot.title);
    primary.setBlocksRaw(
      (snapshot.blocks ?? []).map((b) => ({
        type: b.type,
        data: (b.data as Record<string, unknown>) ?? {},
        isVisible: b.isVisible !== false,
      })),
    );
    setPrimaryMeta({
      excerpt: snapshot.excerpt ?? "",
      coverImage: snapshot.coverImage ?? "",
      category: snapshot.category ?? "GENERAL",
      tags: (snapshot.tags ?? []).join(", "),
    });
    setPrimarySeo({
      metaTitle: snapshot.metaTitle ?? "",
      metaDescription: snapshot.metaDescription ?? "",
      ogImage: snapshot.ogImage ?? "",
    });
    setActiveSide("left");
    setSuccess("Versió restaurada al canvas. Prem Desar per aplicar-la.");
    setTimeout(() => setSuccess(""), 5000);
  }

  async function handleCancelSchedule() {
    if (!activeSidePost) return;
    setError("");
    const res = await fetch(`/api/blog/${activeSidePost.id}/schedule`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error cancel·lant");
    }
    setSuccess("Programació cancel·lada");
    setTimeout(() => setSuccess(""), 3000);
    await loadPost();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-24">
        <p className="text-foreground/50">Article no trobat</p>
        <Link href="/admin/blog" className="mt-4 inline-block">
          <Button variant="outline">Tornar a articles</Button>
        </Link>
      </div>
    );
  }

  const availableCompareLocales = ALL_LOCALES.filter((l) => l !== post.locale);

  const inspectorBlock =
    activeSide === "left" ? primary.selectedBlock : compare.selectedBlock;
  const inspectorOnChange = (data: Record<string, unknown>) => {
    if (activeSide === "left" && primary.selectedBlock) {
      primary.updateBlockData(primary.selectedBlock._clientId, data);
    } else if (activeSide === "right" && compare.selectedBlock) {
      compare.updateBlockData(compare.selectedBlock._clientId, data);
    }
  };

  // The Article tab reflects the metadata of whichever side is active. That
  // way you can edit the EN excerpt without leaving the EN canvas.
  const activeMeta = activeSide === "left" ? primaryMeta : compareMeta;
  const setActiveMeta = activeSide === "left" ? setPrimaryMeta : setCompareMeta;
  const activeSeo = activeSide === "left" ? primarySeo : compareSeo;
  const setActiveSeo = activeSide === "left" ? setPrimarySeo : setCompareSeo;
  const activeSideLocale = activeSide === "left" ? post.locale : compareLocale;
  const activeSidePost = activeSide === "left" ? post : comparePost;
  const activeSideTitle = activeSide === "left" ? primary.title : compare.title;

  const articleTab = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Editant variant
        </label>
        <div className="text-sm font-medium">
          {activeSideLocale ? LOCALE_LABEL[activeSideLocale] : "—"}{" "}
          {activeSideLocale && (
            <span className="text-foreground/40">
              ({activeSideLocale.toUpperCase()})
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Estat
        </label>
        <Badge
          variant={
            activeSidePost?.status === "PUBLISHED"
              ? "accent"
              : activeSidePost?.status === "SCHEDULED"
              ? "secondary"
              : "outline"
          }
        >
          {activeSidePost?.status === "PUBLISHED"
            ? "Publicat"
            : activeSidePost?.status === "SCHEDULED"
            ? "Programat"
            : activeSidePost
            ? "Esborrany"
            : "Variant nova"}
        </Badge>
      </div>
      {activeSidePost && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Slug
          </label>
          <div className="text-sm font-mono text-foreground/70">
            /{activeSidePost.slug}
          </div>
        </div>
      )}
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
        {!post.translationKey && (
          <p className="text-[10px] text-amber-500/80">
            Aquest post no té translationKey. La variant es crearà desvinculada
            (no agrupada amb les altres).
          </p>
        )}
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Categoria
          </label>
          <select
            value={activeMeta.category}
            onChange={(e) =>
              setActiveMeta({ ...activeMeta, category: e.target.value })
            }
            className="w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Tags (comes)
          </label>
          <Input
            value={activeMeta.tags}
            onChange={(e) =>
              setActiveMeta({ ...activeMeta, tags: e.target.value })
            }
            placeholder="IA, WhatsApp, ..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Imatge de portada (URL)
          </label>
          <Input
            value={activeMeta.coverImage}
            onChange={(e) =>
              setActiveMeta({ ...activeMeta, coverImage: e.target.value })
            }
            placeholder="/images/post-cover.jpg"
            className="h-8 text-sm font-mono"
          />
          {activeMeta.coverImage && (
            <div className="mt-2 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeMeta.coverImage}
                alt="Cover preview"
                className="aspect-video w-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Excerpt
          </label>
          <Textarea
            value={activeMeta.excerpt}
            onChange={(e) =>
              setActiveMeta({ ...activeMeta, excerpt: e.target.value })
            }
            rows={3}
            className="text-sm"
          />
        </div>
      </div>

      {activeSidePost &&
        (activeSidePost.status === "DRAFT" ||
          activeSidePost.status === "SCHEDULED") && (
          <div className="border-t border-border pt-3">
            <ScheduleControls
              status={activeSidePost.status}
              publishAt={activeSidePost.publishAt}
              onSchedule={handleSchedule}
              onCancel={handleCancelSchedule}
              disabled={saving || publishing}
            />
          </div>
        )}

      <div className="border-t border-border pt-3">
        <VersionHistory
          apiBase={`/api/blog/${postId}/versions`}
          refreshKey={versionsKey}
          onRestore={handleRestoreVersion}
        />
      </div>

      <div className="border-t border-border pt-3 space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Autor
        </label>
        <div className="text-sm text-foreground/70">{post.author.name}</div>
      </div>
    </div>
  );

  const seoTab = (
    <SEOPanel
      value={activeSeo}
      onChange={setActiveSeo}
      pathHint={`/${activeSideLocale ?? post.locale}/blog/${
        activeSidePost?.slug ?? post.slug
      }`}
      fallbackTitle={activeSideTitle || post.title}
      fallbackDescription={activeMeta.excerpt || undefined}
    />
  );

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 min-h-[calc(100vh-4rem)]">
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon" aria-label="Tornar a Articles">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Editor d&apos;article
            {compareLocale ? (
              <>
                {" "}· {post.locale.toUpperCase()} ↔ {compareLocale.toUpperCase()}
                <Languages className="ml-1.5 inline h-3 w-3 align-text-bottom" />
              </>
            ) : (
              <> · {post.locale.toUpperCase()}</>
            )}
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
        <div onClick={() => setActiveSide("left")}>
          <VariantColumn
            localeLabel={post.locale.toUpperCase()}
            title={primary.title}
            onTitleChange={primary.setTitle}
            pathHint={`/${post.locale}/blog/${post.slug}`}
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
                    ? `/${compareLocale}/blog/${comparePost.slug}`
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
                copyFromLabel={post.locale}
              />
            )}
          </div>
        )}

        <div className="hidden lg:block">
          <InspectorSidebar
            documentTab={articleTab}
            documentTabLabel="Article"
            seoTab={seoTab}
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
