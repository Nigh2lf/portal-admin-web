import { z } from "zod";
import { arquivoOpcional, corHexOpcional, inteiroNaoNegativo, inteiroPositivo, slugObrigatorio, urlOpcional } from "@/features/comum/schemas";

export const itemMenuSchema = z.object({
  label: z.string().trim().min(1, "Informe o rótulo.").max(60, "Máximo de 60 caracteres."),
  path: z.string().trim().min(1, "Informe o caminho.").max(200, "Máximo de 200 caracteres."),
  sort_order: inteiroNaoNegativo(),
  is_active: z.boolean(),
});

export const portalSchema = z.object({
  // Identidade
  slug: slugObrigatorio.pipe(z.string().max(40, "Máximo de 40 caracteres.")),
  name: z.string().trim().min(2, "Informe o nome do portal.").max(100, "Máximo de 100 caracteres."),
  domain: z.string().trim().min(3, "Informe o domínio principal.").max(120, "Máximo de 120 caracteres."),
  /** Um domínio por linha; convertido em lista no envio. */
  extra_domains: z.string(),
  is_active: z.boolean(),
  main_city: z.string().min(1, "Selecione a cidade principal."),
  show_city_filter: z.boolean(),
  cities: z.array(z.string()),
  combined_portals: z.array(z.string()),
  // Contato
  email: z.email("E-mail inválido.").max(120, "Máximo de 120 caracteres."),
  phone: z.string().trim().max(30, "Máximo de 30 caracteres."),
  whatsapp: z.string().trim().max(30, "Máximo de 30 caracteres."),
  address: z.string().trim().max(300, "Máximo de 300 caracteres."),
  // SEO
  seo_title: z.string().trim().min(1, "Informe o título SEO.").max(200, "Máximo de 200 caracteres."),
  seo_description: z.string().trim().min(1, "Informe a descrição SEO.").max(320, "Máximo de 320 caracteres."),
  seo_keywords: z.string().trim(),
  about_text: z.string().trim(),
  // Redes e tracking
  facebook_url: urlOpcional,
  instagram_url: urlOpcional,
  ga4_measurement_id: z.string().trim().max(30, "Máximo de 30 caracteres."),
  recaptcha_site_key: z.string().trim().max(80, "Máximo de 80 caracteres."),
  // Aparência
  logo: arquivoOpcional,
  logo_mobile: arquivoOpcional,
  og_image: arquivoOpcional,
  watermark: arquivoOpcional,
  remover_logo: z.boolean(),
  remover_logo_mobile: z.boolean(),
  remover_og_image: z.boolean(),
  remover_watermark: z.boolean(),
  primary_color: corHexOpcional,
  secondary_color: corHexOpcional,
  // Configurações
  realtors_page_slug: slugObrigatorio.pipe(z.string().max(80, "Máximo de 80 caracteres.")),
  results_per_page: inteiroPositivo(),
  thumbnail_max_width: inteiroPositivo(),
  thumbnail_max_height: inteiroPositivo(),
  watermark_position: z.number({ error: "Selecione a posição." }).int().min(1).max(9),
  // Menu
  menu_items: z.array(itemMenuSchema),
});

export type PortalForm = z.infer<typeof portalSchema>;
