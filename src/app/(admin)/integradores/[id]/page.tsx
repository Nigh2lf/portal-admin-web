import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { IntegradorForm } from "@/features/integradores/integrador-form";
import type { IntegradorDetalhe } from "@/features/integradores/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar integrador" };

export default async function EditarIntegradorPage({ params }: PageProps<"/integradores/[id]">) {
  await requirePermissao("integrator", "update");
  const { id } = await params;
  const integrador = await recurso.obter<IntegradorDetalhe>("integrators", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!integrador) notFound();
  return (
    <>
      <PageHeader titulo={integrador.name} descricao={integrador.slug} crumbs={[{ label: "Integradores", href: "/integradores" }, { label: "Editar" }]} />
      <IntegradorForm integrador={integrador} />
    </>
  );
}
