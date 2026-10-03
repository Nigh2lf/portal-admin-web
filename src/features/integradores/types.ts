export interface IntegradorLista {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface IntegradorDetalhe extends IntegradorLista {
  legacy_id: number | null;
  updated_at: string;
}
