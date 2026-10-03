import { z } from "zod";

/** Inteiro opcional vindo de `<input type="number">`; fica como string no form e vira `null`/número no envio. */
const inteiroOpcional = z.string().trim().refine((v) => v === "" || /^\d+$/.test(v), "Informe um número inteiro (ou deixe em branco).");

export function inteiroOuNulo(v: string): number | null {
  return v.trim() === "" ? null : Number(v);
}

const texto = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`);
const urlOpcional = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`).refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Informe uma URL válida (http:// ou https://).");

export const integracaoSchema = z.object({
  integrator: z.string().nullable(),
  xml_url: urlOpcional(300),
  xml_default_url: urlOpcional(300),
  api_token: texto(100),
  vista_portal_key: texto(100),
  vista_customer_code: texto(100),
  vista_customer_key: texto(50),
  vista_api_url: urlOpcional(200),
  save_all_images: z.boolean(),
  skip_thumbnails: z.boolean(),
  is_active: z.boolean(),
});

export const anuncianteSchema = z
  .object({
    type: z.enum(["OWNER", "BROKER", "AGENCY"]),
    name: texto(120).min(2, "Informe o nome."),
    slug: texto(140),
    document: texto(18),
    email: z.string().trim().max(120).email("E-mail inválido."),
    phone: texto(30),
    phone_secondary: texto(30),
    whatsapp: texto(30),
    website: urlOpcional(200),
    address: texto(300),
    creci: texto(20),
    contact_name: texto(80),
    responsible_broker: texto(80),
    notes: z.string().trim(),
    coupon: texto(45),
    portal: z.string().min(1, "Selecione o portal."),
    plan: z.string().min(1, "Selecione o plano."),
    is_published: z.boolean(),
    notify_by_email: z.boolean(),
    has_hotsite: z.boolean(),
    has_realtor_page: z.boolean(),
    receives_property_requests: z.boolean(),
    property_limit: inteiroOpcional,
    photo_limit: inteiroOpcional,
    featured_limit: inteiroOpcional,
    super_featured_limit: inteiroOpcional,
    accepted_terms_at: z.string(),
    cities: z.array(z.string()),
    tem_integracao: z.boolean(),
    integration: integracaoSchema,
    remover_logo: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const digitos = v.document.replace(/\D/g, "");
    if (digitos && digitos.length !== 11 && digitos.length !== 14) {
      ctx.addIssue({ code: "custom", path: ["document"], message: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)." });
    }
  });

export type AnuncianteForm = z.infer<typeof anuncianteSchema>;
