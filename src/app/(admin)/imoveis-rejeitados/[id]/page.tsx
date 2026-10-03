import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ImovelRejeitadoForm } from "@/features/imoveis-rejeitados/imovel-rejeitado-form";
import type { ImovelRejeitadoDetalhe } from "@/features/imoveis-rejeitados/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar rejeição" };

export default async function EditarImovelRejeitadoPage({ params }: PageProps<"/imoveis-rejeitados/[id]">) {
  await requirePermissao("rejected_property", "update");
  const { id } = await params;
  const registro = await recurso.obter<ImovelRejeitadoDetalhe>("rejected-properties", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!registro) notFound();
  return (
    <>
      <PageHeader
        titulo={registro.property_reference_code}
        descricao={registro.advertiser_name}
        crumbs={[{ label: "Imóveis rejeitados", href: "/imoveis-rejeitados" }, { label: "Editar" }]}
      />
      <ImovelRejeitadoForm registro={registro} />
    </>
  );
}
