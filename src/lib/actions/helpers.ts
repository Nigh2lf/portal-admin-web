import "server-only";

import { ApiError } from "@/lib/api/client";
import type { ActionResult } from "@/lib/api/types";

/** Converte exceções da API em `ActionResult` para formulários. */
export async function executar<T>(fn: () => Promise<T>, mensagemSucesso?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: mensagemSucesso };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message || "Erro ao salvar.", errors: e.errors ?? undefined };
    }
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
}
