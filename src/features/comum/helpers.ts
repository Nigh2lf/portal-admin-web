/** Converte o conteúdo de um textarea "um por linha" em lista sem vazios/duplicados. */
export function linhasParaLista(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return [...new Set(texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))];
}

export function listaParaLinhas(lista: string[] | null | undefined): string {
  return (lista ?? []).join("\n");
}

/** ISO (`2026-10-03T12:52:21`) → valor aceito por `<input type="datetime-local">`. */
export function paraDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/** Decimal da API (string ou número) → número para inputs; `null` quando ausente. */
export function paraNumeroOuNulo(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export const FILTRO_STATUS = {
  nome: "is_active",
  rotulo: "Status",
  opcoes: [
    { value: "true", label: "Ativos" },
    { value: "false", label: "Inativos" },
  ],
};

/** `LookupOption[]` → opções do `Toolbar`. */
export function opcoesDeLookup(lista: Array<{ key: string; value: string }>) {
  return lista.map((o) => ({ value: o.key, label: o.value }));
}
