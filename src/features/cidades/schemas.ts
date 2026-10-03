import { z } from "zod";
import { slugOpcional } from "@/features/comum/schemas";

export const cidadeSchema = z.object({
  state: z.string().min(1, "Selecione o estado."),
  name: z.string().trim().min(2, "Informe o nome da cidade."),
  slug: slugOpcional,
  /** Um alias por linha; convertido em lista no envio. */
  import_aliases: z.string(),
  is_active: z.boolean(),
});

export type CidadeForm = z.infer<typeof cidadeSchema>;
