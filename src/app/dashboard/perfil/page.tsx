"use client";

import { useEffect, useState } from "react";
import { UserCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TwoFactorSection } from "@/components/dashboard/two-factor-section";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role?: string;
  createdAt?: string;
  twoFactorEnabled?: boolean;
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
            twoFactorEnabled: !!data.twoFactorEnabled,
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

        {/* 2FA */}
        <TwoFactorSection
          twoFactorEnabled={!!profile.twoFactorEnabled}
          onChanged={() => {
            // Re-fetch the profile so the local state reflects the new
            // twoFactorEnabled value.
            fetch("/api/profile")
              .then((r) => r.json())
              .then((d) =>
                setProfile((p) => ({ ...p, twoFactorEnabled: !!d.twoFactorEnabled }))
              )
              .catch(() => {});
          }}
        />

        {/* GDPR / data rights */}
        <DataRightsSection />
      </div>
    </div>
  );
}

function DataRightsSection() {
  const [confirmText, setConfirmText] = useState("");
  const [state, setState] = useState<{
    exporting?: boolean;
    deleting?: boolean;
    showDelete?: boolean;
    error?: string;
    message?: string;
  }>({});

  async function handleExport() {
    setState({ exporting: true });
    try {
      const res = await fetch("/api/profile/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error en l'exportació");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auratech-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setState({ message: "Descàrrega iniciada" });
      setTimeout(() => setState((s) => ({ ...s, message: undefined })), 3000);
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  async function handleDelete() {
    setState({ deleting: true });
    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error en l'eliminació");
      }
      // Force a logout-style redirect — the session is now pointing at an
      // anonymised user; reloading clears it.
      window.location.href = "/api/auth/signout?callbackUrl=/";
    } catch (e) {
      setState({ error: (e as Error).message, deleting: false });
    }
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Les meves dades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-1">Exportar les meves dades</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Descarrega un JSON amb tota la teva informació desada al sistema
            (perfil, projectes, factures, missatges, contactes). Compatible amb
            l&apos;Article 20 del RGPD.
          </p>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={state.exporting}
          >
            {state.exporting ? "Generant..." : "Descarregar dades"}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-1">Eliminar el meu compte</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Anonimitzem el teu compte: l&apos;email, nom i telèfon es
            substitueixen, i no podràs tornar a iniciar sessió. Conservem les
            factures i registres econòmics que la legislació espanyola exigeix
            mantenir 6 anys (Article 6.1.c RGPD). Aquesta acció no es pot
            desfer.
          </p>
          {!state.showDelete ? (
            <Button
              variant="outline"
              onClick={() => setState({ showDelete: true })}
              className="text-destructive hover:bg-destructive/10"
            >
              Eliminar el meu compte
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-destructive/30 rounded-md bg-destructive/5">
              <p className="text-sm">
                Per confirmar, escriu <strong>ELIMINAR</strong> a la casella:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                disabled={state.deleting}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={confirmText !== "ELIMINAR" || state.deleting}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  {state.deleting ? "Eliminant..." : "Confirmar eliminació"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setState({})}
                  disabled={state.deleting}
                >
                  Cancel·lar
                </Button>
              </div>
            </div>
          )}
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
