"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoFactorSection } from "@/components/dashboard/two-factor-section";

/**
 * Mandatory 2FA setup gate for SUPERADMIN/ADMIN users who haven't enabled
 * 2FA yet. The middleware redirects them here for any /admin path until
 * twoFactorEnabled becomes true. After confirming, the user must logout +
 * login again so the JWT picks up the new value.
 */
export default function Setup2faPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Initial fetch — confirms whether the user already has 2FA on.
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setEnabled(!!d?.twoFactorEnabled))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-yellow-600" />
              Activació de 2FA obligatòria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Els comptes amb rol <strong>SUPERADMIN</strong> i{" "}
              <strong>ADMIN</strong> han de tenir activada l&apos;autenticació
              de dos factors (2FA) abans de poder accedir al panell admin. Un
              cop l&apos;activis, hauràs de tornar a iniciar sessió perquè la
              sessió actual reculli el canvi.
            </p>
          </CardContent>
        </Card>

        <TwoFactorSection
          twoFactorEnabled={enabled}
          onChanged={() => {
            // Force a fresh JWT — log out and let the user log back in
            // with the 2FA challenge.
            window.location.href = "/api/auth/signout?callbackUrl=/login";
          }}
        />
      </div>
    </div>
  );
}
