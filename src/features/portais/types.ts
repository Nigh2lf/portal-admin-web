export interface PortalLista {
  id: string;
  name: string;
  slug: string;
  domain: string;
  is_active: boolean;
  main_city: string;
  main_city_name: string;
  email: string;
  logo_url: string | null;
  created_at: string;
}

export interface ItemMenuPortal {
  id?: string;
  label: string;
  path: string;
  sort_order: number;
  is_active: boolean;
}

export interface PortalDetalhe {
  id: string;
  slug: string;
  name: string;
  domain: string;
  extra_domains: string[];
  is_active: boolean;
  main_city: string;
  main_city_name: string;
  cities: string[];
  combined_portals: string[];
  show_city_filter: boolean;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  about_text: string;
  facebook_url: string;
  instagram_url: string;
  ga4_measurement_id: string;
  recaptcha_site_key: string;
  logo_url: string | null;
  logo_mobile_url: string | null;
  og_image_url: string | null;
  watermark_url: string | null;
  primary_color: string;
  secondary_color: string;
  realtors_page_slug: string;
  results_per_page: number;
  thumbnail_max_width: number;
  thumbnail_max_height: number;
  watermark_position: number;
  menu_items: ItemMenuPortal[];
  legacy_id: number | null;
  created_at: string;
  updated_at: string;
}

/** Campos de imagem do portal (enviados em multipart, separados do JSON). */
export const IMAGENS_PORTAL = ["logo", "logo_mobile", "og_image", "watermark"] as const;
export type ImagemPortal = (typeof IMAGENS_PORTAL)[number];

export const ROTULO_IMAGEM: Record<ImagemPortal, { rotulo: string; ajuda: string }> = {
  logo: { rotulo: "Logotipo", ajuda: "Exibido no cabeçalho do site." },
  logo_mobile: { rotulo: "Logotipo (mobile)", ajuda: "Versão compacta para telas pequenas." },
  og_image: { rotulo: "Imagem de compartilhamento (OG)", ajuda: "Usada ao compartilhar o site em redes sociais." },
  watermark: { rotulo: "Marca d'água", ajuda: "Aplicada sobre as fotos dos imóveis." },
};

/** Posições da marca d'água numa grade 3×3 (1 = superior esquerda … 9 = inferior direita). */
export const POSICOES_MARCA_DAGUA: Array<{ value: number; label: string }> = [
  { value: 1, label: "Superior esquerda" },
  { value: 2, label: "Superior centro" },
  { value: 3, label: "Superior direita" },
  { value: 4, label: "Centro esquerda" },
  { value: 5, label: "Centro" },
  { value: 6, label: "Centro direita" },
  { value: 7, label: "Inferior esquerda" },
  { value: 8, label: "Inferior centro" },
  { value: 9, label: "Inferior direita" },
];
