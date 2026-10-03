export interface ImportacaoLista {
  id: string;
  advertiser: string;
  advertiser_name: string;
  started_at: string;
  finished_at: string | null;
  total_properties: number;
  valid_properties: number;
  invalid_properties: number;
  report_email_sent: boolean;
  created_at: string;
}

export interface ErroImportacao {
  id: string;
  property_reference_code: string;
  message: string;
  payload: string;
  created_at: string;
}

export interface ImportacaoDetalhe extends ImportacaoLista {
  errors: ErroImportacao[];
  legacy_id: number | null;
  updated_at: string;
}
