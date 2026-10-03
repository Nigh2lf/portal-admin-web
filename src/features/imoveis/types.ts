export type StatusImovel = "DRAFT" | "PUBLISHED";
export type PeriodoTaxa = "MONTHLY" | "YEARLY" | "ONE_TIME";

export interface ImovelLista {
  id: string;
  reference_code: string;
  title: string;
  slug: string;
  status: StatusImovel;
  is_active: boolean;
  is_featured: boolean;
  advertiser: string;
  advertiser_name: string;
  property_type: string;
  property_type_name: string;
  city: string;
  city_name: string;
  neighborhood: string | null;
  neighborhood_name: string | null;
  sale_price: string | null;
  rent_price: string | null;
  seasonal_rent_price: string | null;
  bedrooms: number;
  parking_spaces: number;
  cover_photo_url: string | null;
  updated_at: string;
}

export interface Foto {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface Taxa {
  id?: string;
  description: string;
  /** A API devolve número no detalhe e aceita string decimal na escrita. */
  amount: string | number;
  period: PeriodoTaxa;
  notes: string;
}

export interface ImovelDetalhe {
  id: string;
  advertiser: string;
  advertiser_name: string;
  advertiser_portal: string;
  reference_code: string;
  slug: string;
  title: string;
  status: StatusImovel;
  is_active: boolean;
  is_featured: boolean;
  property_type: string;
  property_type_name: string;
  city: string;
  city_name: string;
  state_code: string;
  neighborhood: string | null;
  neighborhood_name: string | null;
  custom_neighborhood_name: string;
  is_in_condominium: boolean;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spaces: number;
  built_area: string | null;
  total_area: string | null;
  description: string;
  sale_price: string | null;
  rent_price: string | null;
  seasonal_rent_price: string | null;
  published_at: string | null;
  features: string[];
  photos: Foto[];
  fees: Taxa[];
  cover_photo_url: string | null;
  imported_at: string | null;
  legacy_id: number | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_IMOVEL: Array<{ value: StatusImovel; label: string }> = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "PUBLISHED", label: "Publicado" },
];

export const PERIODOS_TAXA: Array<{ value: PeriodoTaxa; label: string }> = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
  { value: "ONE_TIME", label: "Única" },
];

export const ROTULO_PERIODO: Record<PeriodoTaxa, string> = { MONTHLY: "Mensal", YEARLY: "Anual", ONE_TIME: "Única" };
