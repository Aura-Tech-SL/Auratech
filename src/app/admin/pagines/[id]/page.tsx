"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BlockEditorForm } from "@/components/admin/block-editor-form";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  X,
  Type,
  Image,
  Layout,
  Code,
  Quote,
  BarChart3,
  Video,
  Minus,
  List,
  CreditCard,
  Users,
  Mail,
  Grid3X3,
  Space,
  Images,
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Block type registry ──────────────────────────────

const BLOCK_TYPES = [
  { type: "hero", label: "Hero", icon: Layout, category: "Estructura" },
  { type: "rich-text", label: "Text enriquit", icon: Type, category: "Contingut" },
  { type: "image", label: "Imatge", icon: Image, category: "Contingut" },
  { type: "gallery", label: "Galeria", icon: Images, category: "Contingut" },
  { type: "video", label: "Video", icon: Video, category: "Contingut" },
  { type: "code", label: "Codi", icon: Code, category: "Contingut" },
  { type: "cta", label: "Crida a l'accio", icon: MousePointerClick, category: "Estructura" },
  { type: "features-grid", label: "Graella de funcions", icon: Grid3X3, category: "Estructura" },
  { type: "testimonial", label: "Testimoni", icon: Quote, category: "Social" },
  { type: "stats", label: "Estadistiques", icon: BarChart3, category: "Estructura" },
  { type: "divider", label: "Divisor", icon: Minus, category: "Estructura" },
  { type: "accordion", label: "Acordio", icon: List, category: "Contingut" },
  { type: "pricing", label: "Preus", icon: CreditCard, category: "Estructura" },
  { type: "team-grid", label: "Equip", icon: Users, category: "Social" },
  { type: "contact-form", label: "Formulari de contacte", icon: Mail, category: "Estructura" },
  { type: "logo-grid", label: "Graella de logos", icon: Grid3X3, category: "Social" },
  { type: "spacer", label: "Espaiador", icon: Space, category: "Estructura" },
];

function getBlockMeta(type: string) {
  return BLOCK_TYPES.find((bt) => bt.type === type) || { type, label: type, icon: Code, category: "Altres" };
}

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
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
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

  function addBlock(type: string) {
    const newBlock: BlockData = {
      _clientId: genClientId(),
      type,
      order: blocks.length,
      data: {},
      isVisible: true,
    };
    setBlocks([...blocks, newBlock]);
    setExpandedBlock(newBlock._clientId);
    setShowTypePicker(false);
  }

  function removeBlock(clientId: string) {
    setBlocks(blocks.filter((b) => b._clientId !== clientId));
    if (expandedBlock === clientId) setExpandedBlock(null);
  }

  function moveBlock(clientId: string, direction: "up" | "down") {
    const index = blocks.findIndex((b) => b._clientId === clientId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
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

  const categories = Array.from(new Set(BLOCK_TYPES.map((bt) => bt.category)));

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

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Layout className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/50 text-lg">Encara no hi ha blocs</p>
              <p className="text-foreground/30 text-sm mt-1">
                Afegeix blocs per construir el contingut de la pagina
              </p>
            </CardContent>
          </Card>
        )}

        {blocks.map((block, index) => {
          const meta = getBlockMeta(block.type);
          const Icon = meta.icon;
          const isExpanded = expandedBlock === block._clientId;

          return (
            <Card
              key={block._clientId}
              className={cn(
                "transition-all",
                !block.isVisible && "opacity-50",
                isExpanded && "border-accent/30"
              )}
            >
              {/* Block header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() =>
                  setExpandedBlock(isExpanded ? null : block._clientId)
                }
              >
                <GripVertical className="h-4 w-4 text-foreground/20 shrink-0" />
                <Icon className="h-4 w-4 text-foreground/50 shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">
                  {meta.label}
                </span>

                {/* Block actions */}
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => moveBlock(block._clientId, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"
                    title="Moure amunt"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveBlock(block._clientId, "down")}
                    disabled={index === blocks.length - 1}
                    className="p-1.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"
                    title="Moure avall"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(block._clientId)}
                    className="p-1.5 text-foreground/30 hover:text-foreground transition-colors"
                    title={block.isVisible ? "Amagar" : "Mostrar"}
                  >
                    {block.isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeBlock(block._clientId)}
                    className="p-1.5 text-foreground/30 hover:text-destructive transition-colors"
                    title="Eliminar bloc"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-foreground/30 shrink-0 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>

              {/* Block editor */}
              {isExpanded && (
                <CardContent className="pt-0 pb-5 px-5 border-t border-border/50">
                  <div className="pt-4">
                    <BlockEditorForm
                      type={block.type}
                      data={block.data}
                      onChange={(data) => updateBlockData(block._clientId, data)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add block button */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowTypePicker(!showTypePicker)}
          className="w-full gap-2 border-dashed h-12"
        >
          <Plus className="h-4 w-4" />
          Afegir bloc
        </Button>

        {/* Block type picker */}
        {showTypePicker && (
          <Card className="absolute left-0 right-0 top-full mt-2 z-50 shadow-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Escull un tipus de bloc</CardTitle>
              <button
                onClick={() => setShowTypePicker(false)}
                className="text-foreground/30 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="pb-4">
              {categories.map((cat) => (
                <div key={cat} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">
                    {cat}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {BLOCK_TYPES.filter((bt) => bt.category === cat).map(
                      (bt) => {
                        const BtIcon = bt.icon;
                        return (
                          <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type)}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-colors text-center"
                          >
                            <BtIcon className="h-5 w-5 text-foreground/50" />
                            <span className="text-xs text-foreground/70">
                              {bt.label}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
