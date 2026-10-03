import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TipoImovelForm } from "@/features/tipos-de-imovel/tipo-imovel-form";
import type { TipoImovelDetalhe } from "@/features/tipos-de-imovel/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar tipo de imóvel" };

export default async function EditarTipoImovelPage({ params }: PageProps<"/tipos-de-imovel/[id]">) {
  await requirePermissao("property_type", "update");
  const { id } = await params;
  const tipo = await recurso.obter<TipoImovelDetalhe>("property-types", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!tipo) notFound();
  return (
    <>
      <PageHeader titulo={tipo.name} descricao={tipo.slug} crumbs={[{ label: "Tipos de imóvel", href: "/tipos-de-imovel" }, { label: "Editar" }]} />
      <TipoImovelForm tipo={tipo} />
    </>
  );
}
