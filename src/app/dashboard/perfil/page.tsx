"use client";

import { useEffect, useState } from "react";
import { UserCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role?: string;
  createdAt?: string;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileState, setProfileState] = useState<{
    saving: boolean;
    message?: string;
    error?: string;
  }>({ saving: false });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.error) {
          setProfileState({ saving: false, error: data.error });
        } else {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            company: data.company || "",
            role: data.role,
            createdAt: data.createdAt,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setProfileState({ saving: false, error: "No s'ha pogut carregar el perfil" });
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile() {
    setProfileState({ saving: true });
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone || null,
          company: profile.company || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileState({ saving: false, error: data.error || "Error desconegut" });
        return;
      }
      setProfileState({ saving: false, message: "Canvis desats" });
      setTimeout(() => setProfileState((s) => ({ ...s, message: undefined })), 3000);
    } catch {
      setProfileState({ saving: false, error: "Error de xarxa" });
    }
  }

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
            <h3 className="font-semibold text-lg">{profile.name || "—"}</h3>
            <p className="text-sm text-muted-foreground">{profile.company || ""}</p>
            {profile.role && (
              <p className="font-mono text-xs uppercase tracking-wider text-accent mt-1">
                {profile.role}
              </p>
            )}
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
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="bg-muted/40"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  No es pot modificar des d&apos;aquí.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telèfon</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Empresa</label>
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  disabled={profileLoading}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading || profileState.saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {profileState.saving ? "Desant..." : "Desar canvis"}
              </Button>
              {profileState.message && (
                <span className="text-sm text-green-600">{profileState.message}</span>
              )}
              {profileState.error && (
                <span className="text-sm text-destructive">{profileState.error}</span>
              )}
            </div>
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
