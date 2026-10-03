import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CidadeForm } from "@/features/cidades/cidade-form";
import type { CidadeDetalhe } from "@/features/cidades/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar cidade" };

export default async function EditarCidadePage({ params }: PageProps<"/cidades/[id]">) {
  await requirePermissao("city", "update");
  const { id } = await params;
  const [cidade, estados] = await Promise.all([
    recurso.obter<CidadeDetalhe>("cities", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("states").catch(() => []),
  ]);
  if (!cidade) notFound();
  return (
    <>
      <PageHeader titulo={cidade.name} descricao={`${cidade.state_name} (${cidade.state_code})`} crumbs={[{ label: "Cidades", href: "/cidades" }, { label: "Editar" }]} />
      <CidadeForm cidade={cidade} estados={estados} />
    </>
  );
}
