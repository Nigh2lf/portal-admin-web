export type EscopoCaracteristica = "PROPERTY" | "CONDOMINIUM";

export interface CaracteristicaLista {
  id: string;
  scope: EscopoCaracteristica;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CaracteristicaDetalhe extends CaracteristicaLista {
  legacy_id: number | null;
  updated_at: string;
}

export const ESCOPOS: Array<{ value: EscopoCaracteristica; label: string; descricao: string }> = [
  { value: "PROPERTY", label: "Imóvel", descricao: "Infraestrutura do próprio imóvel (ex.: churrasqueira, ar-condicionado)." },
  { value: "CONDOMINIUM", label: "Condomínio", descricao: "Infraestrutura do condomínio (ex.: piscina, salão de festas)." },
];

export const ROTULO_ESCOPO: Record<EscopoCaracteristica, string> = { PROPERTY: "Imóvel", CONDOMINIUM: "Condomínio" };
