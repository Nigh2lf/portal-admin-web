export type PaginaEspaco = "HOME" | "SEARCH" | "PROPERTY";
export type TipoEspaco = "POPUP" | "HORIZONTAL" | "SIDEBAR";

export interface EspacoLista {
  id: string;
  code: string;
  name: string;
  page: PaginaEspaco;
  kind: TipoEspaco;
  width: number;
  height: number;
  /** Decimal como string ou `null`. */
  monthly_price: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EspacoDetalhe extends EspacoLista {
  notes: string;
  legacy_id: number | null;
  updated_at: string;
}

export const PAGINAS: Array<{ value: PaginaEspaco; label: string }> = [
  { value: "HOME", label: "Home" },
  { value: "SEARCH", label: "Lista de imóveis" },
  { value: "PROPERTY", label: "Detalhe do imóvel" },
];

export const TIPOS: Array<{ value: TipoEspaco; label: string }> = [
  { value: "POPUP", label: "Pop-up" },
  { value: "HORIZONTAL", label: "Banner horizontal" },
  { value: "SIDEBAR", label: "Banner lateral" },
];

export const ROTULO_PAGINA = Object.fromEntries(PAGINAS.map((p) => [p.value, p.label])) as Record<PaginaEspaco, string>;
export const ROTULO_TIPO = Object.fromEntries(TIPOS.map((t) => [t.value, t.label])) as Record<TipoEspaco, string>;
