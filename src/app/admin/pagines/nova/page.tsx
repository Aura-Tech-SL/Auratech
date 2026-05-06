"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NovaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [locale, setLocale] = useState("ca");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("El titol es obligatori");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error creant la pagina");
        setLoading(false);
        return;
      }

      router.push(`/admin/pagines/${data.data.id}`);
    } catch {
      setError("Error de connexio");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/pagines">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova pagina</h1>
          <p className="text-foreground/50 mt-1">Crea una nova pagina pel lloc web</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacio de la pagina</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                Titol *
              </label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="El titol de la pagina"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-foreground/30 text-sm font-mono">/</span>
                <Input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="slug-de-la-pagina"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-foreground/30">
                S&apos;auto-genera a partir del titol. Pots editar-lo manualment.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                Descripcio
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breu descripcio de la pagina (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                Idioma
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent/50 transition-colors"
              >
                <option value="ca">CA - Catala</option>
                <option value="es">ES - Castella</option>
                <option value="en">EN - Angles</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="accent" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear pagina
              </Button>
              <Link href="/admin/pagines">
                <Button type="button" variant="ghost">
                  Cancel·lar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
