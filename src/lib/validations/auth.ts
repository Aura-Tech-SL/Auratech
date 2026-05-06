import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email no vàlid"),
  password: z.string().min(6, "La contrasenya ha de tenir almenys 6 caràcters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  email: z.string().email("Email no vàlid"),
  password: z.string().min(6, "La contrasenya ha de tenir almenys 6 caràcters"),
  confirmPassword: z.string(),
  company: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les contrasenyes no coincideixen",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
