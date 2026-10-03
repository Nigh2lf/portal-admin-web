export interface TipoImovelLista {
  id: string;
  name: string;
  slug: string;
  is_residential: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TipoImovelDetalhe extends TipoImovelLista {
  import_aliases: string[];
  mercadolivre_category: string;
  legacy_id: number | null;
  updated_at: string;
}
