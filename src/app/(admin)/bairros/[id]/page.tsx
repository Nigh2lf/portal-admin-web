import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BairroForm } from "@/features/bairros/bairro-form";
import type { BairroDetalhe } from "@/features/bairros/types";
import type { CidadeDetalhe } from "@/features/cidades/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar bairro" };

export default async function EditarBairroPage({ params }: PageProps<"/bairros/[id]">) {
  await requirePermissao("neighborhood", "update");
  const { id } = await params;
  const [bairro, estados] = await Promise.all([
    recurso.obter<BairroDetalhe>("neighborhoods", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("states").catch(() => []),
  ]);
  if (!bairro) notFound();
  // O detalhe do bairro traz só `state_code`; buscamos a cidade para obter o UUID do estado.
  const cidade = await recurso.obter<CidadeDetalhe>("cities", bairro.city).catch(() => null);
  return (
    <>
      <PageHeader titulo={bairro.name} descricao={`${bairro.city_name}/${bairro.state_code}`} crumbs={[{ label: "Bairros", href: "/bairros" }, { label: "Editar" }]} />
      <BairroForm bairro={bairro} estados={estados} estadoInicial={cidade?.state ?? null} />
    </>
  );
}
