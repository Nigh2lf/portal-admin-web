import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PlanoForm } from "@/features/planos/plano-form";
import type { PlanoDetalhe } from "@/features/planos/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar plano" };

export default async function EditarPlanoPage({ params }: PageProps<"/planos/[id]">) {
  await requirePermissao("plan", "update");
  const { id } = await params;
  const plano = await recurso.obter<PlanoDetalhe>("plans", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!plano) notFound();
  return (
    <>
      <PageHeader titulo={plano.name} descricao={plano.slug} crumbs={[{ label: "Planos", href: "/planos" }, { label: "Editar" }]} />
      <PlanoForm plano={plano} />
    </>
  );
}
