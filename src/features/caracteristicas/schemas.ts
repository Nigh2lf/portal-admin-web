import { z } from "zod";
import { inteiroNaoNegativo, slugOpcional } from "@/features/comum/schemas";

export const caracteristicaSchema = z.object({
  scope: z.enum(["PROPERTY", "CONDOMINIUM"], { error: "Selecione o escopo." }),
  name: z.string().trim().min(2, "Informe o nome da característica."),
  slug: slugOpcional,
  is_active: z.boolean(),
  sort_order: inteiroNaoNegativo(),
});

export type CaracteristicaForm = z.infer<typeof caracteristicaSchema>;
