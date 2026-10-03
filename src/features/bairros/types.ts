export interface BairroLista {
  id: string;
  name: string;
  slug: string;
  city: string;
  city_name: string;
  state_code: string;
  is_active: boolean;
  created_at: string;
}

export interface BairroDetalhe extends BairroLista {
  import_aliases: string[];
  legacy_id: number | null;
  updated_at: string;
}
