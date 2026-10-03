import { z } from "zod";

export const estadoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Informe a sigla com 2 letras (ex.: RJ)."),
  name: z.string().trim().min(2, "Informe o nome do estado."),
});

export type EstadoForm = z.infer<typeof estadoSchema>;
