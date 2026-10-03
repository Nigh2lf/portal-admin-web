import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CaracteristicaForm } from "@/features/caracteristicas/caracteristica-form";
import { ROTULO_ESCOPO, type CaracteristicaDetalhe } from "@/features/caracteristicas/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar característica" };

export default async function EditarCaracteristicaPage({ params }: PageProps<"/caracteristicas/[id]">) {
  await requirePermissao("feature", "update");
  const { id } = await params;
  const caracteristica = await recurso.obter<CaracteristicaDetalhe>("features", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!caracteristica) notFound();
  return (
    <>
      <PageHeader titulo={caracteristica.name} descricao={ROTULO_ESCOPO[caracteristica.scope]} crumbs={[{ label: "Características", href: "/caracteristicas" }, { label: "Editar" }]} />
      <CaracteristicaForm caracteristica={caracteristica} />
    </>
  );
}
