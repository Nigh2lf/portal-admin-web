export interface AnuncioLista {
  id: string;
  name: string;
  portal: string;
  portal_name: string;
  placement: string;
  placement_code: string;
  placement_name: string;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface AnuncioDetalhe extends AnuncioLista {
  link_url: string;
  open_in_new_tab: boolean;
  legacy_id: number | null;
  updated_at: string;
}
