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
import { SidePanel } from "@/components/admin/page-editor/side-panel";

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
  const [editingTitle, setEditingTitle] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/pagines">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={titleEdit}
                  onChange={(e) => setTitleEdit(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  className="text-2xl font-bold h-auto py-1"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-2xl font-bold tracking-tight cursor-pointer hover:text-accent transition-colors truncate"
                onClick={() => setEditingTitle(true)}
                title="Fes clic per editar"
              >
                {titleEdit || page.title}
              </h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-foreground/40 font-mono">/{page.slug}</span>
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
              <select
                value={localeEdit}
                onChange={(e) => setLocaleEdit(e.target.value)}
                className="h-7 rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent/50 transition-colors"
              >
                <option value="ca">CA</option>
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Desar esborrany
          </Button>
          <Button
            variant="accent"
            onClick={handlePublish}
            disabled={publishing || saving}
            className="gap-2"
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

      {/* Visual canvas */}
      <VisualCanvas
        blocks={blocks as CanvasBlock[]}
        selectedClientId={selectedClientId}
        onSelect={setSelectedClientId}
        onReorder={reorderBlocks}
        onToggleVisibility={toggleVisibility}
        onDelete={removeBlock}
        onDuplicate={duplicateBlock}
        onInsert={insertBlockAt}
      />

      {/* Side panel — slides in when a block is selected */}
      {selectedBlock && (
        <SidePanel
          blockType={selectedBlock.type}
          blockData={selectedBlock.data}
          isVisible={!!selectedClientId}
          onChange={(data) => updateBlockData(selectedBlock._clientId, data)}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
}
