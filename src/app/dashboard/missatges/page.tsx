"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { cn } from "@/lib/utils";

const messages = [
  {
    id: "1",
    subject: "Actualització del projecte web",
    content: "Hola! T'informem que hem completat la maquetació del frontend. Pots revisar-la al servidor de staging.",
    from: "Equip Auratech",
    date: "2026-02-13",
    read: false,
  },
  {
    id: "2",
    subject: "Factura pendent de pagament",
    content: "Et recordem que la factura FAC-2026-002 venç el 28 de febrer. Si us plau, realitza el pagament quan puguis.",
    from: "Administració",
    date: "2026-02-12",
    read: false,
  },
  {
    id: "3",
    subject: "Reunió de seguiment programada",
    content: "Hem programat una reunió de seguiment per al proper dimarts a les 10:00h. T'enviarem l'enllaç de la videoconferència.",
    from: "Equip Auratech",
    date: "2026-02-10",
    read: true,
  },
  {
    id: "4",
    subject: "Benvingut a Auratech!",
    content: "Benvingut a la plataforma de clients d'Auratech. Des d'aquí podràs seguir l'estat dels teus projectes, consultar factures i comunicar-te amb el nostre equip.",
    from: "Equip Auratech",
    date: "2025-11-01",
    read: true,
  },
];

export default function MissatgesPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const selected = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        label="Espai client"
        title="Missatges"
        description="Comunicació amb l'equip d'Auratech."
        action={
          <Button variant="accent" onClick={() => setShowCompose(!showCompose)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Nou missatge
          </Button>
        }
      />

      {/* Compose */}
      {showCompose && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Input placeholder="Assumpte" />
              <Textarea placeholder="Escriu el teu missatge..." rows={4} />
              <div className="flex gap-2">
                <Button>
                  Enviar
                  <Send className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel·lar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="space-y-2">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={cn(
                "cursor-pointer transition-colors hover:border-accent/30",
                selectedMessage === message.id && "border-accent",
                !message.read && "bg-accent/[0.04]"
              )}
              onClick={() => setSelectedMessage(message.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md border border-border bg-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm", !message.read ? "font-medium" : "text-foreground/70")}>
                        {message.from}
                      </span>
                      <span className="text-[10px] font-mono text-foreground/40">
                        {new Date(message.date).toLocaleDateString("ca-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className={cn("text-sm truncate", !message.read ? "font-medium" : "text-foreground/60")}>
                      {message.subject}
                    </div>
                    <div className="text-xs text-foreground/40 truncate mt-0.5">
                      {message.content}
                    </div>
                  </div>
                  {!message.read && (
                    <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md border border-border bg-secondary/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground/60" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-light tracking-tight truncate">
                      {selected.subject}
                    </CardTitle>
                    <p className="text-[11px] font-mono text-foreground/50 mt-0.5">
                      De: {selected.from} · {new Date(selected.date).toLocaleDateString("ca-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed">
                  {selected.content}
                </p>
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <Textarea placeholder="Respon a aquest missatge..." rows={3} />
                  <Button variant="accent">
                    Respondre
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-foreground/20" />
                <p className="text-sm text-foreground/40">
                  Selecciona un missatge per veure&apos;l
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
