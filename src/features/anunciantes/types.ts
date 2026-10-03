export type TipoAnunciante = "OWNER" | "BROKER" | "AGENCY";

export interface AnuncianteLista {
  id: string;
  name: string;
  slug: string;
  type: TipoAnunciante;
  email: string;
  phone: string;
  plan: string;
  plan_name: string;
  portal: string;
  portal_name: string;
  is_published: boolean;
  /** Só vem no detalhe; a listagem da API ainda não expõe. */
  properties_count?: number;
  created_at: string;
}

export interface IntegracaoDetalhe {
  id: string;
  integrator: string | null;
  integrator_name: string | null;
  xml_url: string;
  xml_default_url: string;
  save_all_images: boolean;
  skip_thumbnails: boolean;
  is_active: boolean;
  last_imported_at: string | null;
  has_api_token: boolean;
  has_vista_credentials: boolean;
}

export interface AnuncianteDetalhe {
  id: string;
  user: string | null;
  user_email: string | null;
  portal: string;
  portal_name: string;
  plan: string;
  plan_name: string;
  type: TipoAnunciante;
  name: string;
  slug: string;
  document: string;
  email: string;
  phone: string;
  phone_secondary: string;
  whatsapp: string;
  website: string;
  address: string;
  logo_url: string | null;
  creci: string;
  contact_name: string;
  responsible_broker: string;
  notes: string;
  coupon: string;
  is_published: boolean;
  accepted_terms_at: string | null;
  notify_by_email: boolean;
  has_hotsite: boolean;
  has_realtor_page: boolean;
  receives_property_requests: boolean;
  property_limit: number | null;
  photo_limit: number | null;
  featured_limit: number | null;
  super_featured_limit: number | null;
  integration: IntegracaoDetalhe | null;
  cities: string[];
  properties_count: number;
  legacy_id: number | null;
  created_at: string;
  updated_at: string;
}

export const TIPOS_ANUNCIANTE: Array<{ value: TipoAnunciante; label: string; descricao: string }> = [
  { value: "OWNER", label: "Proprietário", descricao: "Pessoa física anunciando o próprio imóvel." },
  { value: "BROKER", label: "Corretor", descricao: "Corretor autônomo com CRECI." },
  { value: "AGENCY", label: "Imobiliária", descricao: "Empresa com equipe e carteira de imóveis." },
];

export const ROTULO_TIPO: Record<TipoAnunciante, string> = { OWNER: "Proprietário", BROKER: "Corretor", AGENCY: "Imobiliária" };
