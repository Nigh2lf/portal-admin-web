export interface PostLista {
  id: string;
  title: string;
  slug: string;
  portal: string | null;
  portal_name: string | null;
  author_name: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface PostDetalhe extends PostLista {
  excerpt: string;
  body: string;
  legacy_id: number | null;
  updated_at: string;
}
