import { z } from "zod";
import { arquivoOpcional, urlOpcional } from "@/features/comum/schemas";

/** `exigirImagem` = criação (a API exige o arquivo no POST). */
export const anuncioSchema = (exigirImagem: boolean) =>
  z
    .object({
      portal: z.string().min(1, "Selecione o portal."),
      placement: z.string().min(1, "Selecione o espaço publicitário."),
      name: z.string().trim().min(2, "Informe o nome do anúncio.").max(100, "Máximo de 100 caracteres."),
      image: arquivoOpcional,
      link_url: urlOpcional,
      open_in_new_tab: z.boolean(),
      starts_at: z.string().min(1, "Informe o início da veiculação."),
      ends_at: z.string().min(1, "Informe o fim da veiculação."),
      is_active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (exigirImagem && !v.image) ctx.addIssue({ code: "custom", path: ["image"], message: "Selecione a imagem do anúncio." });
      if (v.starts_at && v.ends_at && v.ends_at < v.starts_at) {
        ctx.addIssue({ code: "custom", path: ["ends_at"], message: "A data final deve ser posterior à inicial." });
      }
    });

export type AnuncioForm = z.infer<ReturnType<typeof anuncioSchema>>;
