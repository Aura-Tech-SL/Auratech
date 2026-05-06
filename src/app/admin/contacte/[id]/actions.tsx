"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  id: string;
  initialNotes: string;
  initialIsRead: boolean;
}

export function ContactSubmissionActions({
  id,
  initialNotes,
  initialIsRead,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [isRead, setIsRead] = useState(initialIsRead);
  const [state, setState] = useState<{
    saving?: boolean;
    deleting?: boolean;
    error?: string;
    message?: string;
  }>({});

  const dirty = notes !== savedNotes;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/contact-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error desconegut");
    }
    return res.json();
  }

  async function handleSaveNotes() {
    setState({ saving: true });
    try {
      await patch({ notes });
      setSavedNotes(notes);
      setState({ message: "Notes desades" });
      setTimeout(() => setState((s) => ({ ...s, message: undefined })), 2500);
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  async function handleToggleRead() {
    setState({ saving: true });
    try {
      const newState = !isRead;
      await patch({ isRead: newState });
      setIsRead(newState);
      setState({ message: newState ? "Marcat com a llegit" : "Marcat com a no llegit" });
      setTimeout(() => setState((s) => ({ ...s, message: undefined })), 2500);
      router.refresh();
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  async function handleDelete() {
    if (!confirm("Segur que vols eliminar aquest missatge?")) return;
    setState({ deleting: true });
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error desconegut");
      }
      router.push("/admin/contacte");
      router.refresh();
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes internes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          maxLength={5000}
          placeholder="Anotacions per al seguiment intern (no visible al client)…"
          className="w-full p-3 border rounded-md bg-background text-sm resize-y"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={handleSaveNotes}
            disabled={!dirty || state.saving || state.deleting}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            {state.saving ? "Desant…" : "Desar notes"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleRead}
            disabled={state.saving || state.deleting}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            {isRead ? "Marcar com a no llegit" : "Marcar com a llegit"}
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={state.saving || state.deleting}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {state.deleting ? "Eliminant…" : "Eliminar"}
          </Button>
        </div>
        {state.message && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
