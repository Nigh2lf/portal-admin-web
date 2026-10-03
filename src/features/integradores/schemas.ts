import { z } from "zod";
import { slugObrigatorio } from "@/features/comum/schemas";

export const integradorSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do integrador."),
  slug: slugObrigatorio,
  is_active: z.boolean(),
});

export type IntegradorForm = z.infer<typeof integradorSchema>;
