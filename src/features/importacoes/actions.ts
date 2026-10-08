"use server";

import { revalidatePath } from "next/cache";
import { executar } from "@/lib/actions/helpers";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionResult } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import type { ImportBatch, ImportBatchDetail, Simulacao } from "./types";

const BATCHES = "/xml-import-runs/batches/";

/** Simulação de um anunciante (não grava nada); a importação de verdade passa por `startBatch`. */
export async function startSimulation(
  advertiser: string,
): Promise<ActionResult<{ started: boolean; batch: string | null }>> {
  await requireSession();
  return executar(() =>
    apiFetch<{ started: boolean; batch: string | null }>(
      "/xml-import-runs/run/",
      {
        method: "POST",
        body: { advertiser, simulate: true },
      },
    ),
  );
}

export async function readSimulation(
  advertiser: string,
): Promise<Simulacao | null> {
  await requireSession();
  try {
    return await apiFetch<Simulacao>(
      `/xml-import-runs/simulation/?advertiser=${encodeURIComponent(advertiser)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Cria e inicia um lote: `advertisers` nulo importa todos os anunciantes com XML ativo. */
export async function startBatch(
  advertisers: string[] | null,
): Promise<ActionResult<ImportBatchDetail>> {
  await requireSession();
  const r = await executar(() =>
    apiFetch<ImportBatchDetail>(BATCHES, {
      method: "POST",
      body: advertisers ? { advertisers } : {},
    }),
  );
  if (r.ok) revalidatePath("/importacoes");
  return r;
}

export async function cancelBatch(
  id: string,
): Promise<ActionResult<ImportBatchDetail>> {
  await requireSession();
  const r = await executar(() =>
    apiFetch<ImportBatchDetail>(`${BATCHES}${id}/cancel/`, { method: "POST" }),
  );
  if (r.ok) revalidatePath("/importacoes");
  return r;
}

export async function readActiveBatch(): Promise<ImportBatchDetail | null> {
  await requireSession();
  return apiFetch<ImportBatchDetail | null>(`${BATCHES}active/`);
}

export async function readBatch(id: string): Promise<ImportBatchDetail | null> {
  await requireSession();
  try {
    return await apiFetch<ImportBatchDetail>(`${BATCHES}${id}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function readRecentBatches(): Promise<ImportBatch[]> {
  await requireSession();
  return apiFetch<ImportBatch[]>(BATCHES);
}
