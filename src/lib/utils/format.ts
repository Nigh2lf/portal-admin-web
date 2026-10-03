const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR");

export function formatarMoeda(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return brl.format(Number(v));
}

export function formatarNumero(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return num.format(Number(v));
}

export function formatarData(iso: string | null | undefined, comHora = false) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(comHora ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function iniciais(nome: string) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
}

export function slugify(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
