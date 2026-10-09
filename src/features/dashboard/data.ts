import "server-only";

import { apiFetch } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import type { ListParams } from "@/lib/api/types";

export interface UserSummary {
  total: number;
  active: number;
  logged_in: number;
  of_published_advertisers: number;
  admins: number;
}

export interface AdvertiserSummary {
  total: number;
  published: number;
  published_with_properties: number;
  with_active_xml: number;
}

export interface PropertySummary {
  total: number;
  visible: number;
  hidden_by_advertiser: number;
  inactive: number;
  of_xml_advertisers: number;
}

/** Contadores de um recurso (`GET /<recurso>/summary/`); `null` se a API falhar. */
export async function fetchSummary<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(`/${path}/summary/`);
  } catch {
    return null;
  }
}

/** Total de uma listagem com os filtros informados; `null` se a API falhar. */
export async function fetchCount(path: string, params: ListParams = {}): Promise<number | null> {
  try {
    const page = await recurso.listar<{ id: string }>(path, { ...params, page_size: 1 });
    return page.count;
  } catch {
    return null;
  }
}

/** Data ISO (UTC) de `days` dias atrás, para filtros `created_at__gte`. */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
