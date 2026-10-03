import "server-only";

import { cookies } from "next/headers";
import type { Envelope } from "./types";

export const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
export const ACCESS_COOKIE = "admin_access";
export const REFRESH_COOKIE = "admin_refresh";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> | null = null,
  ) {
    super(message);
  }
}

function extrairErros(error: Envelope<unknown>["error"]): Record<string, string[]> | null {
  if (!error || typeof error !== "object") return null;
  const out: Record<string, string[]> = {};
  for (const [campo, valor] of Object.entries(error)) {
    if (campo === "detail") continue;
    out[campo] = Array.isArray(valor) ? valor.map(String) : [String(valor)];
  }
  return Object.keys(out).length ? out : null;
}

export interface ApiInit extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  /** true = não envia Authorization (login, refresh). */
  anonymous?: boolean;
}

/**
 * Chamada à API com envelope. Lança `ApiError` em falha; devolve `data` em sucesso.
 * Usa o access token do cookie, salvo quando `token` ou `anonymous` são informados.
 */
export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { body, token, anonymous, headers: extra, ...rest } = init;
  const headers = new Headers(extra);
  headers.set("Accept", "application/json");

  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  if (!anonymous) {
    const access = token ?? (await cookies()).get(ACCESS_COOKIE)?.value;
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers,
    body: payload,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as Envelope<T> | Record<string, unknown> | null;

  if (json && typeof json === "object" && "success" in json) {
    const env = json as Envelope<T>;
    if (!res.ok || !env.success) {
      throw new ApiError(res.status, env.message || res.statusText, extrairErros(env.error));
    }
    return env.data;
  }

  if (!res.ok) {
    const detail = (json as { detail?: string } | null)?.detail;
    throw new ApiError(res.status, detail || res.statusText, json ? extrairErros(json as Envelope<unknown>["error"]) : null);
  }
  return json as T;
}
