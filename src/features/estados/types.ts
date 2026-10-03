export interface EstadoLista {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface EstadoDetalhe extends EstadoLista {
  updated_at: string;
}
