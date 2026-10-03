import { z } from "zod";
import { slugOpcional } from "@/features/comum/schemas";

export const bairroSchema = z.object({
  /** Só para filtrar o select de cidades; não é enviado à API. */
  estado: z.string(),
  city: z.string().min(1, "Selecione a cidade."),
  name: z.string().trim().min(2, "Informe o nome do bairro."),
  slug: slugOpcional,
  /** Um alias por linha; convertido em lista no envio. */
  import_aliases: z.string(),
  is_active: z.boolean(),
});

export type BairroForm = z.infer<typeof bairroSchema>;
