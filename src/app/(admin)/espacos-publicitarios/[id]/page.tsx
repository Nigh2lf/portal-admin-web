import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EspacoForm } from "@/features/espacos-publicitarios/espaco-form";
import type { EspacoDetalhe } from "@/features/espacos-publicitarios/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar espaço publicitário" };

export default async function EditarEspacoPage({ params }: PageProps<"/espacos-publicitarios/[id]">) {
  await requirePermissao("ad_placement", "update");
  const { id } = await params;
  const espaco = await recurso.obter<EspacoDetalhe>("ad-placements", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!espaco) notFound();
  return (
    <>
      <PageHeader titulo={`${espaco.code} – ${espaco.name}`} crumbs={[{ label: "Espaços publicitários", href: "/espacos-publicitarios" }, { label: "Editar" }]} />
      <EspacoForm espaco={espaco} />
    </>
  );
}
