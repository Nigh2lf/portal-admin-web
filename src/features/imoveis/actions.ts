"use server";

import { revalidatePath } from "next/cache";
import { executar } from "@/lib/actions/helpers";
import { API_BASE_URL, apiFetch } from "@/lib/api/client";
import type { ActionResult } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import type { Foto } from "./types";

/** Ações de fotos do imóvel; todas devolvem a lista completa e atualizada de fotos. */

const ORIGEM_API = new URL(API_BASE_URL).origin;

/**
 * Os endpoints de fotos devolvem `image_url` relativa (`/media/...`), diferente do detalhe
 * do imóvel (absoluta). Normaliza para o navegador não resolver contra o host do admin.
 */
function absolutizar(fotos: Foto[]): Foto[] {
  const abs = (u: string | null) => (u && u.startsWith("/") ? `${ORIGEM_API}${u}` : u);
  return fotos.map((f) => ({ ...f, image_url: abs(f.image_url) ?? f.image_url, thumbnail_url: abs(f.thumbnail_url) }));
}

async function fotosApi(path: string, init: Parameters<typeof apiFetch>[1]): Promise<Foto[]> {
  return absolutizar(await apiFetch<Foto[]>(path, init));
}

function revalidar(id: string) {
  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${id}`);
  revalidatePath(`/imoveis/${id}/fotos`);
}

/** `POST properties/{id}/photos/` multipart com uma ou mais partes `images`. */
export async function enviarFotos(id: string, form: FormData): Promise<ActionResult<Foto[]>> {
  await requireSession();
  const arquivos = form.getAll("images").filter((f) => f instanceof File && f.size > 0);
  if (!arquivos.length) return { ok: false, message: "Selecione ao menos uma imagem." };
  const fd = new FormData();
  for (const f of arquivos) fd.append("images", f);
  const r = await executar(() => fotosApi(`/properties/${id}/photos/`, { method: "POST", body: fd }), `${arquivos.length} foto(s) enviada(s).`);
  if (r.ok) revalidar(id);
  return r;
}

export async function excluirFoto(id: string, fotoId: string): Promise<ActionResult<Foto[]>> {
  await requireSession();
  const r = await executar(() => fotosApi(`/properties/${id}/photos/${fotoId}/`, { method: "DELETE" }), "Foto excluída.");
  if (r.ok) revalidar(id);
  return r;
}

export async function definirCapa(id: string, fotoId: string): Promise<ActionResult<Foto[]>> {
  await requireSession();
  const r = await executar(() => fotosApi(`/properties/${id}/photos/${fotoId}/cover/`, { method: "POST" }), "Capa definida.");
  if (r.ok) revalidar(id);
  return r;
}

export async function reordenarFotos(id: string, ids: string[]): Promise<ActionResult<Foto[]>> {
  await requireSession();
  const r = await executar(() => fotosApi(`/properties/${id}/photos/reorder/`, { method: "POST", body: { ids } }), "Ordem atualizada.");
  if (r.ok) revalidar(id);
  return r;
}
