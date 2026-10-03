import "server-only";

import { API_BASE_URL } from "@/lib/api/client";

/** Origem onde a API serve `MEDIA_URL` (`/media/...`): a mesma do `API_BASE_URL`, salvo `MEDIA_BASE_URL`. */
const MEDIA_ORIGIN = (process.env.MEDIA_BASE_URL ?? new URL(API_BASE_URL).origin).replace(/\/$/, "");

/**
 * A API devolve `*_url` relativo (`/media/blog/x.png`); resolvido aqui contra a origem da API
 * para que `<img>` no admin (outra porta/domínio) encontre o arquivo. URLs absolutas passam intactas.
 */
export function urlMidia(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) return path;
  return `${MEDIA_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
