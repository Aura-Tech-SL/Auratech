"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const result = await res.json();
        setError(result.error || "Error en el registre");
      }
    } catch {
      setError("Error de connexió");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted/50 to-transparent">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Auratech</span>
            </Link>
            <h1 className="text-2xl font-bold">Crear compte</h1>
            <p className="text-muted-foreground mt-1">Registra&apos;t per accedir a l&apos;àrea de clients</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nom complet *</label>
              <Input placeholder="El teu nom" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email *</label>
              <Input type="email" placeholder="email@exemple.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Empresa</label>
                <Input placeholder="La teva empresa" {...register("company")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telèfon</label>
                <Input placeholder="+34 XXX" {...register("phone")} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Contrasenya *</label>
              <Input type="password" placeholder="Mínim 6 caràcters" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirmar contrasenya *</label>
              <Input type="password" placeholder="Repeteix la contrasenya" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrant..." : "Crear compte"}
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ja tens compte?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Inicia sessió
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
