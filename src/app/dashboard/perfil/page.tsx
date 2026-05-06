"use client";

import { useState } from "react";
import { UserCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PerfilPage() {
  const [profile, setProfile] = useState({
    name: "Oscar Rovira",
    email: "oscar.rovira@auratech.cat",
    phone: "+34 93 XXX XX XX",
    company: "Auratech",
  });

  // Password change state
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdState, setPwdState] = useState<{
    loading: boolean;
    message?: string;
    error?: string;
  }>({ loading: false });

  async function handleChangePassword() {
    setPwdState({ loading: true });
    if (pwd.next !== pwd.confirm) {
      setPwdState({ loading: false, error: "Les contrasenyes noves no coincideixen" });
      return;
    }
    if (pwd.next.length < 8) {
      setPwdState({ loading: false, error: "La nova contrasenya ha de tenir almenys 8 caràcters" });
      return;
    }
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdState({ loading: false, error: data.error || "Error desconegut" });
        return;
      }
      setPwdState({ loading: false, message: data.message || "Contrasenya actualitzada" });
      setPwd({ current: "", next: "", confirm: "" });
    } catch {
      setPwdState({ loading: false, error: "Error de xarxa" });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">El meu perfil</h1>
        <p className="text-muted-foreground mt-1">Gestiona la teva informació personal</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.company}</p>
            <p className="text-xs text-muted-foreground mt-1">Client des de novembre 2025</p>
            <Button variant="outline" className="mt-4 w-full" size="sm">
              Canviar foto
            </Button>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informació personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telèfon</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Empresa</label>
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Desar canvis
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Seguretat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Contrasenya actual</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={pwd.current}
                  onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nova contrasenya</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirmar contrasenya</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={pwdState.loading || !pwd.current || !pwd.next || !pwd.confirm}
              >
                {pwdState.loading ? "Desant..." : "Canviar contrasenya"}
              </Button>
              {pwdState.message && (
                <span className="text-sm text-green-600">{pwdState.message}</span>
              )}
              {pwdState.error && (
                <span className="text-sm text-destructive">{pwdState.error}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
