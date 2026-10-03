import "server-only";

import { API_BASE_URL } from "@/lib/api/client";

const ORIGEM_API = new URL(API_BASE_URL).origin;

/** A API devolve `*_url` relativo (`/media/...`); prefixa com a origem da API para uso em `<img>`. */
export function urlMidia(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${ORIGEM_API}${url.startsWith("/") ? "" : "/"}${url}`;
}
