export interface PlanoLista {
  id: string;
  name: string;
  slug: string;
  /** Decimal como string ou `null` = sob consulta. */
  monthly_price: string | null;
  property_limit: number;
  photo_limit: number;
  featured_limit: number;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PlanoDetalhe extends PlanoLista {
  has_realtor_page: boolean;
  receives_property_requests: boolean;
  has_hotsite: boolean;
  is_owner_only: boolean;
  legacy_id: number | null;
  updated_at: string;
}
