/** Converte ISO (API) para o valor aceito por `<input type="datetime-local">` no fuso do navegador. */
export function isoParaDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converte o valor de `<input type="datetime-local">` para ISO; vazio vira `null`. */
export function datetimeLocalParaIso(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
