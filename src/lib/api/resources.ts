import "server-only";

import { apiFetch } from "./client";
import type { ListParams, LookupOption, Paginated } from "./types";

export function montarQuery(params: ListParams = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** CRUD genérico sobre um recurso da API (`/api/v1/<recurso>/`). */
export const recurso = {
  listar: <T>(path: string, params?: ListParams) => apiFetch<Paginated<T>>(`/${path}/${montarQuery(params)}`),
  obter: <T>(path: string, id: string) => apiFetch<T>(`/${path}/${id}/`),
  criar: <T>(path: string, body: unknown) => apiFetch<T>(`/${path}/`, { method: "POST", body }),
  atualizar: <T>(path: string, id: string, body: unknown, parcial = true) =>
    apiFetch<T>(`/${path}/${id}/`, { method: parcial ? "PATCH" : "PUT", body }),
  excluir: (path: string, id: string) => apiFetch<void>(`/${path}/${id}/`, { method: "DELETE" }),
  lookup: (path: string, params?: ListParams) => apiFetch<LookupOption[]>(`/${path}/lookup/${montarQuery(params)}`),
};

/** Lê `searchParams` de uma página de listagem e devolve `ListParams`. */
export function paramsDeBusca(
  sp: Record<string, string | string[] | undefined>,
  filtros: string[] = [],
  padrao: ListParams = {},
): ListParams {
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const out: ListParams = { ...padrao, page: Number(um(sp.page) ?? 1) || 1, page_size: Number(um(sp.page_size) ?? 20) || 20 };
  if (um(sp.search)) out.search = um(sp.search);
  if (um(sp.ordering)) out.ordering = um(sp.ordering);
  for (const f of filtros) if (um(sp[f])) out[f] = um(sp[f]);
  return out;
}
