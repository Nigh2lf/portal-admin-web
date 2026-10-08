export type RunStatus =
  "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED" | "SKIPPED";

export interface ImportacaoLista {
  id: string;
  advertiser: string;
  advertiser_name: string;
  batch: string | null;
  status: RunStatus;
  error_message: string;
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

export interface AnuncianteXml {
  id: string;
  name: string;
  legacy_id: number | null;
  integrator: string | null;
  xml_url: string;
  last_imported_at: string | null;
}

export interface Simulacao {
  running?: boolean;
  erro?: string;
  gerado_em: string;
  formato?: string;
  baixado_em?: string;
  total_feed?: number;
  novos?: number;
  alterados?: number;
  iguais?: number;
  excluidos?: number;
  ignorados?: number;
  codigos_novos?: string[];
  codigos_alterados?: Array<{ codigo: string; campos: string[] }>;
  codigos_excluidos?: string[];
  ignorados_lista?: Array<{ codigo: string; motivo: string }>;
}

// ---------------------------------------------------------------- lotes

export type BatchStatus =
  | "QUEUED"
  | "RUNNING"
  | "CANCELLING"
  | "CANCELLED"
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED";

export const ACTIVE_BATCH_STATUSES: BatchStatus[] = [
  "QUEUED",
  "RUNNING",
  "CANCELLING",
];

export interface ImportBatch {
  id: string;
  status: BatchStatus;
  origin: "MANUAL" | "CRON" | "COMMAND";
  scope: "ALL" | "SELECTED";
  total_advertisers: number;
  done: number;
  ok: number;
  failed: number;
  skipped: number;
  cancelled: number;
  current_advertiser: string | null;
  current_advertiser_name: string | null;
  created_by: string | null;
  created_by_name: string | null;
  deadline_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  heartbeat_at: string | null;
  error_message: string;
  created_at: string;
}

export interface ImportBatchRun {
  id: string;
  advertiser: string;
  advertiser_name: string;
  status: RunStatus;
  error_message: string;
  started_at: string;
  finished_at: string | null;
  total_properties: number;
  valid_properties: number;
  invalid_properties: number;
}

export interface ImportBatchDetail extends ImportBatch {
  runs: ImportBatchRun[];
  pending: Array<{ id: string; name: string }>;
}

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  QUEUED: "Na fila",
  RUNNING: "Executando",
  CANCELLING: "Cancelando",
  CANCELLED: "Cancelado",
  SUCCESS: "Concluído",
  PARTIAL: "Concluído com falhas",
  FAILED: "Falhou",
};

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  RUNNING: "Em andamento",
  SUCCESS: "Concluída",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
  SKIPPED: "Não executada",
};

export const BATCH_ORIGIN_LABEL: Record<ImportBatch["origin"], string> = {
  MANUAL: "Painel",
  CRON: "Cron",
  COMMAND: "Comando",
};

/** Nome em português dos campos que a simulação aponta como alterados. */
export const CAMPOS_IMOVEL: Record<string, string> = {
  reference_code: "Código",
  is_active: "Ativo",
  ad_type: "Tipo do anúncio",
  property_type: "Tipo",
  city: "Cidade",
  neighborhood: "Bairro",
  neighborhood_name: "Bairro (texto)",
  is_in_condominium: "Condomínio",
  bedrooms: "Quartos",
  suites: "Suítes",
  bathrooms: "Banheiros",
  parking_spaces: "Vagas",
  built_area: "Área útil",
  total_area: "Área total",
  description: "Descrição",
  sale_price: "Preço de venda",
  rent_price: "Aluguel",
  seasonal_rent_price: "Temporada",
  deleted_at: "Reativado",
  fotos: "Fotos",
  caracteristicas: "Características",
  taxas: "Taxas",
};
