import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  email: z.string().email("Email no vàlid"),
  phone: z.string().optional(),
  subject: z.string().min(3, "L'assumpte ha de tenir almenys 3 caràcters"),
  message: z.string().min(10, "El missatge ha de tenir almenys 10 caràcters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
