"use server";

import { revalidatePath } from "next/cache";
import { executar } from "@/lib/actions/helpers";
import { apiFetch } from "@/lib/api/client";
import type { ActionResult } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import type { PedidoLimpeza, ResultadoLimpeza } from "./types";

export async function limparCache(pedido: PedidoLimpeza): Promise<ActionResult<ResultadoLimpeza>> {
  await requireSession();
  const r = await executar(
    () => apiFetch<ResultadoLimpeza>("/public-cache/invalidate/", { method: "POST", body: pedido }),
    "Cache limpo.",
  );
  if (r.ok) revalidatePath("/cache");
  return r;
}
