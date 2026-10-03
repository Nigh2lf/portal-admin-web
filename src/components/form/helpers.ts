import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ActionResult } from "@/lib/api/types";

/** Mapeia `erros` da API (`{campo: [msg]}`) para os campos do react-hook-form. */
export function aplicarErros<T extends FieldValues>(setError: UseFormSetError<T>, r: ActionResult<unknown>) {
  if (!r.errors) return;
  for (const [campo, msgs] of Object.entries(r.errors)) {
    setError(campo as Path<T>, { type: "server", message: msgs.join(" ") });
  }
}

export function mensagemErro(r: ActionResult<unknown>) {
  if (r.errors) {
    const nonField = r.errors.non_field_errors ?? r.errors.detail;
    if (nonField) return nonField.join(" ");
  }
  return r.message ?? "Verifique os campos destacados.";
}

/** Converte `""` em `null` e strings numéricas em número, para payloads de API. */
export function limparPayload<T extends Record<string, unknown>>(valores: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(valores)) out[k] = v === "" ? null : v;
  return out;
}
