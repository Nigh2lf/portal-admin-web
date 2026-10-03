export interface BannerLista {
  id: string;
  portal: string | null;
  portal_name: string | null;
  home_image_url: string | null;
  inner_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BannerDetalhe extends BannerLista {
  updated_at: string;
}
