"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  VisualCanvas,
  arrayMove,
  type CanvasBlock,
} from "@/components/admin/page-editor/visual-canvas";
import { InspectorSidebar } from "@/components/admin/page-editor/inspector-sidebar";

// ── Types ────────────────────────────────────────────

interface BlockData {
  _clientId: string;
  id?: string;
  type: string;
  order: number;
  data: Record<string, any>;
  isVisible: boolean;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
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

let clientIdCounter = 0;
function genClientId() {
  return `block_${Date.now()}_${++clientIdCounter}`;
}

// ── Component ────────────────────────────────────────

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [titleEdit, setTitleEdit] = useState("");
  const [localeEdit, setLocaleEdit] = useState("ca");

  const loadPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (!res.ok) throw new Error("Error carregant la pagina");
      const { data } = await res.json();
      setPage(data);
      setTitleEdit(data.title);
      setLocaleEdit(data.locale || "ca");
      setBlocks(
        data.blocks.map((b: any) => ({
          _clientId: genClientId(),
          id: b.id,
          type: b.type,
          order: b.order,
          data: b.data || {},
          isVisible: b.isVisible,
        }))
      );
    } catch (err: any) {
      setError(err.message || "Error carregant");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  function insertBlockAt(type: string, atIndex: number) {
    const newBlock: BlockData = {
      _clientId: genClientId(),
      type,
      order: atIndex,
      data: {},
      isVisible: true,
    };
    const next = [...blocks];
    next.splice(atIndex, 0, newBlock);
    setBlocks(next.map((b, i) => ({ ...b, order: i })));
    setSelectedClientId(newBlock._clientId);
  }

  function removeBlock(clientId: string) {
    setBlocks(blocks.filter((b) => b._clientId !== clientId));
    if (selectedClientId === clientId) setSelectedClientId(null);
  }

  function duplicateBlock(clientId: string) {
    const index = blocks.findIndex((b) => b._clientId === clientId);
    if (index === -1) return;
    const original = blocks[index];
    const copy: BlockData = {
      _clientId: genClientId(),
      type: original.type,
      order: index + 1,
      data: JSON.parse(JSON.stringify(original.data)),
      isVisible: original.isVisible,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    setBlocks(next.map((b, i) => ({ ...b, order: i })));
    setSelectedClientId(copy._clientId);
  }

  function reorderBlocks(oldIndex: number, newIndex: number) {
    const moved = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(moved.map((b, i) => ({ ...b, order: i })));
  }

  function toggleVisibility(clientId: string) {
    setBlocks(
      blocks.map((b) =>
        b._clientId === clientId ? { ...b, isVisible: !b.isVisible } : b
      )
    );
  }

  function updateBlockData(clientId: string, data: Record<string, any>) {
    setBlocks(
      blocks.map((b) => (b._clientId === clientId ? { ...b, data } : b))
    );
  }

  const selectedBlock = blocks.find((b) => b._clientId === selectedClientId) ?? null;

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update title and locale if changed
      if (titleEdit !== page?.title || localeEdit !== ((page as any)?.locale || "ca")) {
        await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleEdit, locale: localeEdit }),
        });
      }

      // Save blocks
      const res = await fetch(`/api/pages/${pageId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: blocks.map((b, i) => ({
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
        throw new Error(data.error || "Error desant");
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

  async function handlePublish() {
    setPublishing(true);
    setError("");

    try {
      // Save first
      await handleSave();

      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error publicant");
      }

      setSuccess("Pagina publicada!");
      setTimeout(() => setSuccess(""), 3000);
      await loadPage();
    } catch (err: any) {
      setError(err.message || "Error publicant");
    } finally {
      setPublishing(false);
    }
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
          Idioma
        </label>
        <select
          value={localeEdit}
          onChange={(e) => setLocaleEdit(e.target.value)}
          className="w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <option value="ca">Català</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
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
            Editor de pàgina · {localeEdit.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Messages */}
      {(error || success) && (
        <div className="px-4 sm:px-6 lg:px-8 pt-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3 flex items-center justify-between">
              {error}
              <button onClick={() => setError("")} className="text-destructive/60 hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-md px-4 py-3 flex items-center justify-between">
              {success}
              <button onClick={() => setSuccess("")} className="text-accent/60 hover:text-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2-column layout: canvas (left) + inspector (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 px-4 sm:px-6 lg:px-8 py-6">
        <div className="min-w-0 space-y-6">
          {/* Title (editable, big) */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              Títol
            </p>
            <Input
              value={titleEdit}
              onChange={(e) => setTitleEdit(e.target.value)}
              placeholder="Sense títol"
              className="!text-3xl !h-auto !py-2 !px-2 !font-light !tracking-tight border-transparent hover:border-border focus:border-accent/50 transition-colors bg-transparent"
            />
            <p className="text-xs text-foreground/40 font-mono pl-2">
              /{localeEdit}/{page.slug}
            </p>
          </div>

          {/* Visual canvas */}
          <VisualCanvas
            blocks={blocks as CanvasBlock[]}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClientId}
            onChange={updateBlockData}
            onReorder={reorderBlocks}
            onToggleVisibility={toggleVisibility}
            onDelete={removeBlock}
            onDuplicate={duplicateBlock}
            onInsert={insertBlockAt}
          />
        </div>

        {/* Inspector sidebar — sticky, always visible */}
        <div className="hidden lg:block">
          <InspectorSidebar
            documentTab={documentTab}
            selectedBlock={
              selectedBlock
                ? {
                    type: selectedBlock.type,
                    data: selectedBlock.data,
                    onChange: (data) =>
                      updateBlockData(selectedBlock._clientId, data),
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
