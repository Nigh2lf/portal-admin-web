export interface EscopoCache {
  value: string;
  label: string;
}

export interface LimpezaCache {
  at: string;
  origin: "manual" | "batch";
  user: string;
  portal: string;
  scopes: string[];
  items: string[];
  site_ok: boolean | null;
  site_error: string;
}

export interface SituacaoCache {
  enabled: boolean;
  backend: string;
  site_configured: boolean;
  scopes: EscopoCache[];
  portals: Array<{ slug: string; name: string }>;
  history: LimpezaCache[];
}

export interface PedidoLimpeza {
  portal: string;
  scopes: string[];
  property_code: string;
}

export interface ResultadoLimpeza {
  tags: string[];
  site: { ok: boolean; status: number | null; error: string } | null;
}
