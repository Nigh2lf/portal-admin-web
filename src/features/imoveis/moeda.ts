/**
 * Máscara BRL para inputs: o formulário guarda "1.250.000,00" e a API recebe "1250000.00".
 */
const fmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Aplica a máscara a partir do que foi digitado (só dígitos contam; os 2 últimos são centavos). */
export function mascararBRL(digitado: string) {
  const digitos = digitado.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digitos) return "";
  return fmt.format(Number(digitos) / 100);
}

/** "1.250.000,00" → "1250000.00" (ou null quando vazio). */
export function brlParaDecimal(mascarado: string): string | null {
  const digitos = mascarado.replace(/\D/g, "");
  if (!digitos) return null;
  return (Number(digitos) / 100).toFixed(2);
}

/** "1250000.00" (API) → "1.250.000,00" (input). */
export function decimalParaBRL(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === "") return "";
  const n = Number(valor);
  return Number.isNaN(n) ? "" : fmt.format(n);
}

/** Área em m²: aceita "120,5" ou "120.5" e devolve "120.50" ou null. */
export function areaParaDecimal(texto: string): string | null {
  const t = texto.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n.toFixed(2);
}

export function decimalParaArea(valor: string | null | undefined) {
  if (valor === null || valor === undefined || valor === "") return "";
  const n = Number(valor);
  return Number.isNaN(n) ? "" : String(n).replace(".", ",");
}
