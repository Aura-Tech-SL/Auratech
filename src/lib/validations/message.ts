import { z } from "zod";

export const messageCreateSchema = z.object({
  receiverId: z.string().min(1, "Destinatari requerit"),
  content: z
    .string()
    .min(1, "Missatge buit")
    .max(5000, "Missatge massa llarg (màxim 5000 caràcters)"),
});

export type MessageCreateData = z.infer<typeof messageCreateSchema>;
