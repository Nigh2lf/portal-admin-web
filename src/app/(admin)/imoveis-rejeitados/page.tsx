import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { ImovelRejeitadoLista } from "@/features/imoveis-rejeitados/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Imóveis rejeitados" };

export default async function ImoveisRejeitadosPage({ searchParams }: PageProps<"/imoveis-rejeitados">) {
  const sessao = await requirePermissao("rejected_property");
  const params = paramsDeBusca(await searchParams, ["advertiser"], { ordering: "-created_at" });
  const [pagina, anunciantes] = await Promise.all([
    recurso.listar<ImovelRejeitadoLista>("rejected-properties", params),
    recurso.lookup("advertisers").catch(() => [] as LookupOption[]),
  ]);

  return (
    <>
      <PageHeader
        titulo="Imóveis rejeitados"
        descricao="Referências barradas na moderação; a importação XML pula estes códigos."
        crumbs={[{ label: "Imóveis rejeitados" }]}
        acoes={
          pode(sessao, "rejected_property", "create") && (
            <Button asChild>
              <Link href="/imoveis-rejeitados/novo"><Plus data-icon="inline-start" /> Nova rejeição</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por referência, motivo ou anunciante…"
        filtros={[{ nome: "advertiser", rotulo: "Anunciante", opcoes: anunciantes.map((a) => ({ value: a.key, label: a.value })) }]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "property_reference_code", titulo: "Referência", ordenavel: "property_reference_code", render: (r) => <Link href={`/imoveis-rejeitados/${r.id}`} className="font-mono text-xs font-medium hover:underline">{r.property_reference_code}</Link> },
          { chave: "advertiser_name", titulo: "Anunciante", ordenavel: "advertiser__name" },
          { chave: "reason", titulo: "Motivo", render: (r) => r.reason || <span className="text-muted-foreground">—</span> },
          { chave: "created_at", titulo: "Rejeitado em", ordenavel: "created_at", render: (r) => formatarData(r.created_at, true) },
        ]}
        acoes={(r) => (
          <RowActions
            id={r.id}
            editarHref={`/imoveis-rejeitados/${r.id}`}
            recurso="rejected-properties"
            rotulo={`a rejeição da referência ${r.property_reference_code}`}
            revalidar={["/imoveis-rejeitados"]}
            podeEditar={pode(sessao, "rejected_property", "update")}
            podeExcluir={pode(sessao, "rejected_property", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum imóvel rejeitado", descricao: "Nenhuma referência foi barrada na moderação." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
