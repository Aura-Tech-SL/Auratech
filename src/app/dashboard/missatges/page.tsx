"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missatges</h1>
          <p className="text-muted-foreground mt-1">Comunicació amb l&apos;equip d&apos;Auratech</p>
        </div>
        <Button onClick={() => setShowCompose(!showCompose)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Nou missatge
        </Button>
      </div>

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
                "cursor-pointer transition-colors",
                selectedMessage === message.id && "border-primary",
                !message.read && "bg-primary/5"
              )}
              onClick={() => setSelectedMessage(message.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm", !message.read && "font-semibold")}>
                        {message.from}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleDateString("ca-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className={cn("text-sm truncate", !message.read && "font-medium")}>
                      {message.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {message.content}
                    </div>
                  </div>
                  {!message.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
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
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selected.subject}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      De: {selected.from} — {new Date(selected.date).toLocaleDateString("ca-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{selected.content}</p>
                <div className="mt-6 pt-6 border-t space-y-4">
                  <Textarea placeholder="Respon a aquest missatge..." rows={3} />
                  <Button>
                    Respondre
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Selecciona un missatge per veure&apos;l</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
