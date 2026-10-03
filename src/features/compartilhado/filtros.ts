import "server-only";

import type { FiltroSelect } from "@/components/data/toolbar";
import { recurso } from "@/lib/api/resources";

/** Monta um filtro de `Toolbar` a partir de `GET /<recurso>/lookup/`; falha vira lista vazia. */
export async function filtroLookup(nome: string, rotulo: string, path: string): Promise<FiltroSelect> {
  const opcoes = await recurso.lookup(path).catch(() => []);
  return { nome, rotulo, opcoes: opcoes.map((o) => ({ value: o.key, label: o.value })) };
}

export const filtroPortal = () => filtroLookup("portal", "Portal", "portals");
export const filtroAnunciante = () => filtroLookup("advertiser", "Anunciante", "advertisers");

/** Parâmetros de período aceitos pelas listagens de leads. */
export const FILTROS_PERIODO = ["created_at__gte", "created_at__lte"];
