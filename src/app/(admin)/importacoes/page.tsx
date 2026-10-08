import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { filtroAnunciante } from "@/features/compartilhado/filtros";
import { AtualizarEnquantoRoda } from "@/features/importacoes/atualizar-enquanto-roda";
import { BatchProgress } from "@/features/importacoes/batch-progress";
import { ImportNow } from "@/features/importacoes/import-now";
import { RunStatusBadge } from "@/features/importacoes/status-badges";
import {
  RUN_STATUS_LABEL,
  type AnuncianteXml,
  type ImportBatchDetail,
  type ImportacaoLista,
} from "@/features/importacoes/types";
import { apiFetch } from "@/lib/api/client";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarNumero } from "@/lib/utils/format";

export const metadata = { title: "Importações XML" };

export default async function ImportacoesPage({
  searchParams,
}: PageProps<"/importacoes">) {
  const sessao = await requirePermissao("xml_import_run");
  const params = paramsDeBusca(
    await searchParams,
    [
      "advertiser",
      "batch",
      "status",
      "report_email_sent",
      "started_at__gte",
      "started_at__lte",
    ],
    { ordering: "-started_at" },
  );
  const podeImportar = pode(sessao, "xml_import_run", "create");
  const [pagina, fAnunciante, anunciantes, activeBatch] = await Promise.all([
    recurso.listar<ImportacaoLista>("xml-import-runs", params),
    filtroAnunciante(),
    // API sem a rota (deploy fora de ordem) não derruba a listagem: o botão só não aparece.
    podeImportar
      ? apiFetch<AnuncianteXml[]>("/xml-import-runs/advertisers/").catch(
          () => null,
        )
      : Promise.resolve(null),
    apiFetch<ImportBatchDetail | null>(
      "/xml-import-runs/batches/active/",
    ).catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        titulo="Importações XML"
        descricao="Execuções da importação dos XML dos anunciantes. Roda sozinha toda noite, das 1h às 3h."
        crumbs={[{ label: "Importações XML" }]}
        acoes={
          anunciantes ? (
            <ImportNow advertisers={anunciantes} disabled={!!activeBatch} />
          ) : undefined
        }
      />
      <div className="mb-6">
        <BatchProgress initial={activeBatch} canCancel={podeImportar} />
      </div>
      <AtualizarEnquantoRoda
        ativo={
          !activeBatch && pagina.results.some((i) => i.status === "RUNNING")
        }
      />
      <Toolbar
        placeholder="Buscar por anunciante…"
        filtros={[
          fAnunciante,
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
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "advertiser_name",
            titulo: "Anunciante",
            render: (i) => (
              <Link
                href={`/importacoes/${i.id}`}
                className="font-medium hover:underline"
              >
                {i.advertiser_name}
              </Link>
            ),
          },
          {
            chave: "status",
            titulo: "Status",
            render: (i) => (
              <span title={i.error_message || undefined}>
                <RunStatusBadge status={i.status} />
              </span>
            ),
          },
          {
            chave: "started_at",
            titulo: "Início",
            ordenavel: "started_at",
            render: (i) => formatarData(i.started_at, true),
          },
          {
            chave: "finished_at",
            titulo: "Término",
            ordenavel: "finished_at",
            render: (i) =>
              i.finished_at ? formatarData(i.finished_at, true) : "—",
          },
          {
            chave: "total_properties",
            titulo: "Total",
            ordenavel: "total_properties",
            className: "text-right tabular-nums",
            render: (i) => formatarNumero(i.total_properties),
          },
          {
            chave: "valid_properties",
            titulo: "Válidos",
            className: "text-right tabular-nums",
            render: (i) => (
              <span className="text-success">
                {formatarNumero(i.valid_properties)}
              </span>
            ),
          },
          {
            chave: "invalid_properties",
            titulo: "Inválidos",
            ordenavel: "invalid_properties",
            className: "text-right tabular-nums",
            render: (i) => (
              <span
                className={
                  i.invalid_properties > 0 ? "font-medium text-destructive" : ""
                }
              >
                {formatarNumero(i.invalid_properties)}
              </span>
            ),
          },
          {
            chave: "report_email_sent",
            titulo: "Relatório",
            render: (i) => (
              <StatusBadge
                ativo={i.report_email_sent}
                rotulos={["Enviado", "Não enviado"]}
              />
            ),
          },
        ]}
        acoes={(i) => (
          <RowActions
            id={i.id}
            recurso="xml-import-runs"
            rotulo={`a importação de ${i.advertiser_name} em ${formatarData(i.started_at, true)}`}
            revalidar={["/importacoes"]}
            podeExcluir={pode(sessao, "xml_import_run", "delete")}
            extras={<AcaoVer href={`/importacoes/${i.id}`} />}
          />
        )}
        vazio={{
          titulo: "Nenhuma importação registrada",
          descricao:
            "Os registros são gravados automaticamente pelo job de importação.",
        }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
