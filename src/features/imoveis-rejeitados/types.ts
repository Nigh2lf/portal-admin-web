export interface ImovelRejeitadoLista {
  id: string;
  advertiser: string;
  advertiser_name: string;
  property_reference_code: string;
  reason: string;
  created_at: string;
}

export interface ImovelRejeitadoDetalhe extends ImovelRejeitadoLista {
  updated_at: string;
}
