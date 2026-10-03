import { z } from "zod";

export const imovelRejeitadoSchema = z.object({
  advertiser: z.string().min(1, "Selecione o anunciante."),
  property_reference_code: z.string().trim().min(1, "Informe o código de referência.").max(45, "Máximo de 45 caracteres."),
  reason: z.string().trim().max(200, "Máximo de 200 caracteres."),
});

export type ImovelRejeitadoForm = z.infer<typeof imovelRejeitadoSchema>;
