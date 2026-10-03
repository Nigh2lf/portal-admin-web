export interface BloqueioLista {
  id: string;
  email: string;
  ip_address: string | null;
  reason: string;
  is_active: boolean;
  created_at: string;
}

export interface BloqueioDetalhe extends BloqueioLista {
  legacy_id: number | null;
  updated_at: string;
}
