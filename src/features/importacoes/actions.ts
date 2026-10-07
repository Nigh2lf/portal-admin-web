"use server";

import { revalidatePath } from "next/cache";
import { executar } from "@/lib/actions/helpers";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActionResult } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import type { Simulacao } from "./types";

export async function iniciarImportacao(
  advertiser: string,
  simulate: boolean,
): Promise<ActionResult<{ started: boolean }>> {
  await requireSession();
  const r = await executar(() =>
    apiFetch<{ started: boolean }>("/xml-import-runs/run/", {
      method: "POST",
      body: { advertiser, simulate },
    }),
  );
  if (r.ok && !simulate) revalidatePath("/importacoes");
  return r;
}

export async function lerSimulacao(
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
