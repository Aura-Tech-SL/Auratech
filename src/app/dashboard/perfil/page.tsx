"use client";

import { useState } from "react";
import { UserCircle, Mail, Phone, Building, Save } from "lucide-react";
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
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nova contrasenya</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirmar contrasenya</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline">Canviar contrasenya</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
