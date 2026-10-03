import { z } from "zod";
import { arquivoOpcional } from "@/features/comum/schemas";

/** `exigirHome` = criação (a API exige `home_image` no POST). */
export const bannerSchema = (exigirHome: boolean) =>
  z
    .object({
      /** `null` = vale para todos os portais. */
      portal: z.string().nullable(),
      home_image: arquivoOpcional,
      inner_image: arquivoOpcional,
      remover_inner_image: z.boolean(),
      is_active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (exigirHome && !v.home_image) ctx.addIssue({ code: "custom", path: ["home_image"], message: "Selecione a imagem da home." });
    });

export type BannerForm = z.infer<ReturnType<typeof bannerSchema>>;
