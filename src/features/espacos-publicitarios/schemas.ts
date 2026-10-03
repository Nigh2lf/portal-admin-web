import { z } from "zod";
import { decimalOpcional, inteiroPositivo } from "@/features/comum/schemas";

export const espacoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Informe o código.")
    .max(10, "Máximo de 10 caracteres.")
    .regex(/^[A-Z0-9_-]+$/, "Use letras, números, hífen ou sublinhado."),
  name: z.string().trim().min(2, "Informe o nome.").max(60, "Máximo de 60 caracteres."),
  page: z.enum(["HOME", "SEARCH", "PROPERTY"], { error: "Selecione a página." }),
  kind: z.enum(["POPUP", "HORIZONTAL", "SIDEBAR"], { error: "Selecione o formato." }),
  width: inteiroPositivo("Informe a largura em pixels."),
  height: inteiroPositivo("Informe a altura em pixels."),
  monthly_price: decimalOpcional,
  notes: z.string().trim().max(200, "Máximo de 200 caracteres."),
  is_active: z.boolean(),
});

export type EspacoForm = z.infer<typeof espacoSchema>;
