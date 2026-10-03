import { z } from "zod";
import { inteiroNaoNegativo, slugOpcional } from "@/features/comum/schemas";

export const tipoImovelSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do tipo."),
  slug: slugOpcional,
  /** Um alias por linha; convertido em lista no envio. */
  import_aliases: z.string(),
  mercadolivre_category: z.string().trim().max(70, "Máximo de 70 caracteres."),
  is_residential: z.boolean(),
  is_active: z.boolean(),
  sort_order: inteiroNaoNegativo(),
});

export type TipoImovelForm = z.infer<typeof tipoImovelSchema>;
