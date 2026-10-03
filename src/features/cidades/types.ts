export interface CidadeLista {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  state_name: string;
  is_active: boolean;
  created_at: string;
}

export interface CidadeDetalhe extends CidadeLista {
  import_aliases: string[];
  legacy_id: number | null;
  updated_at: string;
}
