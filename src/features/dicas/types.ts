export interface DicaLista {
  id: string;
  title: string;
  portal: string | null;
  portal_name: string | null;
  is_active: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface DicaDetalhe extends DicaLista {
  body: string;
  legacy_id: number | null;
  updated_at: string;
}
