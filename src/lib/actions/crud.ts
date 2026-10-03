"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import type { ActionResult, ListParams, LookupOption } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import { executar } from "./helpers";

/**
 * Actions genéricas de CRUD. A autorização real é feita pela API por
 * `view_name`; aqui só garantimos sessão e revalidamos as rotas afetadas.
 */
export async function salvarRecurso<T = Record<string, unknown>>(
  path: string,
  id: string | null,
  body: unknown,
  revalidar: string[] = [],
): Promise<ActionResult<T>> {
  await requireSession();
  const r = await executar(
    () => (id ? recurso.atualizar<T>(path, id, body) : recurso.criar<T>(path, body)),
    id ? "Registro atualizado." : "Registro criado.",
  );
  if (r.ok) for (const p of revalidar) revalidatePath(p);
  return r;
}

export async function salvarRecursoMultipart<T = Record<string, unknown>>(
  path: string,
  id: string | null,
  form: FormData,
  revalidar: string[] = [],
): Promise<ActionResult<T>> {
  await requireSession();
  const r = await executar(
    () => apiFetch<T>(`/${path}/${id ? `${id}/` : ""}`, { method: id ? "PATCH" : "POST", body: form }),
    id ? "Registro atualizado." : "Registro criado.",
  );
  if (r.ok) for (const p of revalidar) revalidatePath(p);
  return r;
}

export async function excluirRecurso(path: string, id: string, revalidar: string[] = []): Promise<ActionResult<void>> {
  await requireSession();
  const r = await executar(() => recurso.excluir(path, id), "Registro excluído.");
  if (r.ok) for (const p of revalidar) revalidatePath(p);
  return r;
}

export async function buscarLookup(path: string, params: ListParams = {}): Promise<LookupOption[]> {
  await requireSession();
  try {
    return await recurso.lookup(path, params);
  } catch (e) {
    if (e instanceof ApiError) return [];
    throw e;
  }
}

export async function chamarApi<T = unknown>(path: string, metodo: "POST" | "DELETE" | "PATCH", body?: unknown, revalidar: string[] = []): Promise<ActionResult<T>> {
  await requireSession();
  const r = await executar(() => apiFetch<T>(path, { method: metodo, body }));
  if (r.ok) for (const p of revalidar) revalidatePath(p);
  return r;
}

export async function irPara(href: string): Promise<never> {
  redirect(href);
}
