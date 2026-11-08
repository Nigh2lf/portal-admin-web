import { PaginationBar } from "@/components/data/pagination-bar";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { filtroAnunciante } from "@/features/compartilhado/filtros";
import { AtualizarEnquantoRoda } from "@/features/importacoes/atualizar-enquanto-roda";
import { RunsTable } from "@/features/importacoes/runs-table";
import {
  RUN_STATUS_LABEL,
  type ImportacaoLista,
} from "@/features/importacoes/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Execuções avulsas" };

const RUN_FILTERS = [
  "advertiser",
  "status",
  "report_email_sent",
  "started_at__gte",
  "started_at__lte",
];

/** Execuções sem lote: histórico do sistema antigo e importações de um anunciante pelo comando. */
export default async function StandaloneRunsPage({
  searchParams,
}: PageProps<"/importacoes/avulsas">) {
  const session = await requirePermissao("xml_import_run");
  const params = {
    ...paramsDeBusca(await searchParams, RUN_FILTERS, {
      ordering: "-started_at",
    }),
    batch__isnull: "true",
  };
  const [page, advertiserFilter] = await Promise.all([
    recurso.listar<ImportacaoLista>("xml-import-runs", params),
    filtroAnunciante(),
  ]);

  return (
    <>
      <PageHeader
        titulo="Execuções avulsas"
        descricao="Importações que não pertencem a um lote: o histórico do sistema antigo e as rodadas de um anunciante pelo comando no servidor."
        crumbs={[
          { label: "Importações XML", href: "/importacoes" },
          { label: "Execuções avulsas" },
        ]}
      />
      <AtualizarEnquantoRoda
        ativo={page.results.some((r) => r.status === "RUNNING")}
      />
      <Toolbar
        placeholder="Buscar por anunciante…"
        filtros={[
          advertiserFilter,
          {
            nome: "status",
            rotulo: "Status",
            opcoes: Object.entries(RUN_STATUS_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            nome: "report_email_sent",
            rotulo: "Relatório",
            opcoes: [
              { value: "true", label: "E-mail enviado" },
              { value: "false", label: "E-mail não enviado" },
            ],
          },
        ]}
      >
        <FiltroPeriodo campo="started_at" />
      </Toolbar>
      <RunsTable
        runs={page.results}
        ordering={params.ordering as string}
        canDelete={pode(session, "xml_import_run", "delete")}
        revalidatePath="/importacoes/avulsas"
        empty={{
          titulo: "Nenhuma execução avulsa",
          descricao: "As importações feitas em lote ficam em Importações XML.",
        }}
      />
      <PaginationBar pagina={page} />
    </>
  );
}
