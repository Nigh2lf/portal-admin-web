import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DicaForm } from "@/features/dicas/dica-form";
import type { DicaDetalhe } from "@/features/dicas/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar dica" };

export default async function EditarDicaPage({ params }: PageProps<"/dicas/[id]">) {
  await requirePermissao("tip", "update");
  const { id } = await params;
  const dica = await recurso.obter<DicaDetalhe>("tips", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!dica) notFound();
  return (
    <>
      <PageHeader titulo={dica.title} descricao={dica.portal_name ?? "Todos os portais"} crumbs={[{ label: "Dicas", href: "/dicas" }, { label: "Editar" }]} />
      <DicaForm dica={dica} />
    </>
  );
}
