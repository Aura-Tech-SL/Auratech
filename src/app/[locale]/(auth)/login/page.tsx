"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        code: twoFactorCode || undefined,
        redirect: false,
      });

      if (result?.error === "TOTP_REQUIRED") {
        setNeeds2fa(true);
        setError("");
      } else if (result?.error === "TOTP_INVALID") {
        setNeeds2fa(true);
        setError("Codi 2FA invàlid. Torna-ho a provar.");
        setTwoFactorCode("");
      } else if (result?.error?.startsWith("Massa intents")) {
        setError(result.error);
      } else if (result?.error) {
        setError("Email o contrasenya incorrectes");
        setNeeds2fa(false);
        setTwoFactorCode("");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error en iniciar sessió");
    } finally {
      setIsLoading(false);
    }
  };

  const submitWith2fa = () => {
    const values = getValues();
    if (values.email && values.password) {
      onSubmit(values);
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
            <h1 className="text-2xl font-bold">Iniciar sessió</h1>
            <p className="text-muted-foreground mt-1">Accedeix al teu espai de client</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" placeholder="email@exemple.com" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Contrasenya</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {needs2fa && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Codi 2FA
                </label>
                <Input
                  placeholder="123456 o recovery code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  autoComplete="one-time-code"
                  autoFocus
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Introdueix el codi de 6 dígits del teu autenticador o un
                  recovery code (XXXX-XXXX).
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (needs2fa && !twoFactorCode)}
              onClick={(e) => {
                if (needs2fa) {
                  e.preventDefault();
                  submitWith2fa();
                }
              }}
            >
              {isLoading
                ? "Accedint..."
                : needs2fa
                ? "Verificar codi"
                : "Accedir"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            No tens compte?{" "}
            <Link href="/registre" className="text-primary font-medium hover:underline">
              Registra&apos;t
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
