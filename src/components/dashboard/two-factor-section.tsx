"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SetupResponse {
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}

interface Props {
  twoFactorEnabled: boolean;
  onChanged?: () => void;
}

export function TwoFactorSection({ twoFactorEnabled, onChanged }: Props) {
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);
  const [state, setState] = useState<{
    busy?: boolean;
    error?: string;
    message?: string;
  }>({});

  async function handleStartSetup() {
    setState({ busy: true });
    try {
      const res = await fetch("/api/profile/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSetup(data);
      setState({});
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  async function handleConfirm() {
    setState({ busy: true });
    try {
      const res = await fetch("/api/profile/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Codi invàlid");
      setSetup(null);
      setCode("");
      setState({ message: "2FA activat. Recorda guardar els recovery codes." });
      onChanged?.();
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  async function handleDisable() {
    setState({ busy: true });
    try {
      const res = await fetch("/api/profile/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: disablePassword,
          code: disableCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
      setState({ message: "2FA desactivat." });
      onChanged?.();
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  }

  function copyRecovery() {
    if (!setup) return;
    navigator.clipboard.writeText(setup.recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {twoFactorEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-yellow-600" />
          )}
          Autenticació de dos factors (2FA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {twoFactorEnabled && !showDisable && (
          <>
            <p className="text-sm text-muted-foreground">
              El 2FA està <strong className="text-green-600">actiu</strong>.
              Caldrà un codi del teu autenticador cada vegada que iniciïs sessió.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowDisable(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              Desactivar 2FA
            </Button>
          </>
        )}

        {twoFactorEnabled && showDisable && (
          <div className="space-y-3 p-4 border border-destructive/30 rounded-md bg-destructive/5">
            <p className="text-sm">
              Per desactivar el 2FA cal la teva contrasenya i un codi actual de
              l&apos;autenticador (o un recovery code).
            </p>
            <Input
              type="password"
              placeholder="Contrasenya actual"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              placeholder="Codi 6 dígits o recovery code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              autoComplete="one-time-code"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDisable}
                disabled={state.busy || !disablePassword || !disableCode}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {state.busy ? "Desactivant..." : "Confirmar desactivació"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDisable(false)}
                disabled={state.busy}
              >
                Cancel·lar
              </Button>
            </div>
          </div>
        )}

        {!twoFactorEnabled && !setup && (
          <>
            <p className="text-sm text-muted-foreground">
              Afegeix un segon factor d&apos;autenticació amb una app TOTP
              (Google Authenticator, Authy, 1Password). Recomanat per a
              comptes admin; obligatori per a SUPERADMIN i ADMIN.
            </p>
            <Button onClick={handleStartSetup} disabled={state.busy}>
              {state.busy ? "Generant..." : "Activar 2FA"}
            </Button>
          </>
        )}

        {setup && (
          <div className="space-y-5">
            <div>
              <h4 className="font-medium mb-2">1. Escaneja el QR</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qrCode}
                  alt="QR codi 2FA"
                  className="w-48 h-48 border rounded-md"
                />
                <div className="flex-1 space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Si no pots escanejar, introdueix manualment aquest secret a
                    l&apos;app:
                  </p>
                  <code className="block p-2 bg-muted rounded font-mono text-xs break-all">
                    {setup.secret}
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center justify-between">
                2. Guarda els recovery codes
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRecovery}
                  className="text-xs"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" /> Copiat
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
                    </>
                  )}
                </Button>
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Cadascun et permet entrar una sola vegada si perds el telèfon.
                <strong> No es tornaran a mostrar.</strong> Guarda&apos;ls en un
                gestor de contrasenyes.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-muted rounded-md font-mono text-xs">
                {setup.recoveryCodes.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Confirma amb un codi</h4>
              <div className="flex gap-3 items-start">
                <Input
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="max-w-32 font-mono text-center"
                />
                <Button onClick={handleConfirm} disabled={state.busy || code.length < 6}>
                  {state.busy ? "Verificant..." : "Confirmar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSetup(null);
                    setCode("");
                  }}
                >
                  Cancel·lar
                </Button>
              </div>
            </div>
          </div>
        )}

        {state.message && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
