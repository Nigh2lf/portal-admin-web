export interface MenuItemLista {
  id: string;
  portal: string;
  portal_name: string;
  portal_slug: string;
  label: string;
  path: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface MenuItemDetalhe {
  id: string;
  portal: string;
  portal_name: string;
  label: string;
  path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
