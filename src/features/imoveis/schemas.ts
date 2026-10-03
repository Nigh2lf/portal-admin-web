import { z } from "zod";

/** Inteiro pequeno vindo de `<input type="number">`; fica como string no form e vira número no envio. */
const inteiro = z.string().trim().refine((v) => v === "" || /^\d{1,3}$/.test(v), "Informe um número inteiro de 0 a 999.");

const area = z.string().trim().refine((v) => v === "" || /^\d{1,10}([.,]\d{1,2})?$/.test(v), "Informe a área em m² (ex.: 120,50).");

const moeda = z.string();

export const taxaSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição.").max(150, "Máximo de 150 caracteres."),
  amount: moeda.refine((v) => v.replace(/\D/g, "") !== "", "Informe o valor."),
  period: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"]),
  notes: z.string().trim().max(300, "Máximo de 300 caracteres."),
});

export const imovelSchema = z
  .object({
    advertiser: z.string().min(1, "Selecione o anunciante."),
    reference_code: z.string().trim().min(1, "Informe o código de referência.").max(45, "Máximo de 45 caracteres."),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    is_active: z.boolean(),
    ad_type: z.enum(["NORMAL", "FEATURED", "SUPER_FEATURED"]),
    property_type: z.string().min(1, "Selecione o tipo de imóvel."),
    city: z.string().min(1, "Selecione a cidade."),
    neighborhood: z.string().nullable(),
    custom_neighborhood_name: z.string().trim().max(120, "Máximo de 120 caracteres."),
    is_in_condominium: z.boolean(),
    bedrooms: inteiro,
    suites: inteiro,
    bathrooms: inteiro,
    parking_spaces: inteiro,
    built_area: area,
    total_area: area,
    sale_price: moeda,
    rent_price: moeda,
    seasonal_rent_price: moeda,
    fees: z.array(taxaSchema),
    description: z.string().trim(),
    features: z.array(z.string()),
    /** Só na edição: envia `title`/`slug` vazios para o backend regenerar. */
    regenerar_titulo: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const temPreco = [v.sale_price, v.rent_price, v.seasonal_rent_price].some((p) => p.replace(/\D/g, "") !== "");
    if (!temPreco) {
      ctx.addIssue({ code: "custom", path: ["sale_price"], message: "Informe ao menos um valor: venda, aluguel ou temporada." });
    }
  });

export type ImovelForm = z.infer<typeof imovelSchema>;
export type TaxaForm = z.infer<typeof taxaSchema>;
