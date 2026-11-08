import { notFound } from "next/navigation";
import { PaginationBar } from "@/components/data/pagination-bar";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { ListaDetalhe, SecaoDetalhe } from "@/features/compartilhado/detalhe";
import { AtualizarEnquantoRoda } from "@/features/importacoes/atualizar-enquanto-roda";
import { BatchProgress } from "@/features/importacoes/batch-progress";
import { formatDuration } from "@/features/importacoes/format";
import { RunsTable } from "@/features/importacoes/runs-table";
import { StatCard } from "@/features/importacoes/stat-card";
import { BatchStatusBadge } from "@/features/importacoes/status-badges";
import {
  ACTIVE_BATCH_STATUSES,
  BATCH_ORIGIN_LABEL,
  RUN_STATUS_LABEL,
  type ImportBatchDetail,
  type ImportacaoLista,
} from "@/features/importacoes/types";
import { ApiError, apiFetch } from "@/lib/api/client";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarNumero } from "@/lib/utils/format";

export const metadata = { title: "Importação XML em lote" };

const RUNS_PAGE_SIZE = 50;

export default async function ImportBatchPage({
  params,
  searchParams,
}: PageProps<"/importacoes/lotes/[id]">) {
  const session = await requirePermissao("xml_import_run");
  const { id } = await params;
  const batch = await apiFetch<ImportBatchDetail>(
    `/xml-import-runs/batches/${encodeURIComponent(id)}/`,
  ).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!batch) notFound();

  const runParams = {
    ...paramsDeBusca(await searchParams, ["status"], {
      ordering: "advertiser__name",
    }),
    batch: batch.id,
    page_size: RUNS_PAGE_SIZE,
  };
  const runs = await recurso.listar<ImportacaoLista>(
    "xml-import-runs",
    runParams,
  );
  const active = ACTIVE_BATCH_STATUSES.includes(batch.status);
  const canImport = pode(session, "xml_import_run", "create");
  const startedAt = batch.started_at ?? batch.created_at;
  const scope =
    batch.scope === "ALL"
      ? "Todos os anunciantes com XML ativo"
      : `${formatarNumero(batch.total_advertisers)} anunciante(s) escolhido(s)`;

  return (
    <>
      <PageHeader
        titulo={`Importação de ${formatarData(startedAt, true)}`}
        descricao={`${BATCH_ORIGIN_LABEL[batch.origin]}${batch.created_by_name ? ` por ${batch.created_by_name}` : ""} · ${scope}`}
        crumbs={[
          { label: "Importações XML", href: "/importacoes" },
          { label: formatarData(startedAt, true) },
        ]}
      />
      <AtualizarEnquantoRoda ativo={active} />
      <div className="flex flex-col gap-6">
        {active ? (
          <BatchProgress
            initial={batch}
            canCancel={canImport}
            showDetailsLink={false}
          />
        ) : (
          <SecaoDetalhe titulo="Resumo">
            <ListaDetalhe
              itens={[
                {
                  rotulo: "Status",
                  valor: <BatchStatusBadge status={batch.status} />,
                },
                { rotulo: "Origem", valor: BATCH_ORIGIN_LABEL[batch.origin] },
                { rotulo: "Anunciantes", valor: scope },
                { rotulo: "Solicitado por", valor: batch.created_by_name },
                { rotulo: "Início", valor: formatarData(startedAt, true) },
                {
                  rotulo: "Término",
                  valor: formatarData(batch.finished_at, true),
                },
                {
                  rotulo: "Duração",
                  valor: formatDuration(batch.started_at, batch.finished_at),
                },
                ...(batch.deadline_at
                  ? [
                      {
                        rotulo: "Limite da janela",
                        valor: formatarData(batch.deadline_at, true),
                      },
                    ]
                  : []),
              ]}
            />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Anunciantes importados"
                value={batch.ok}
                className="text-success"
              />
              <StatCard
                label="Com falha"
                value={batch.failed}
                className={batch.failed > 0 ? "text-destructive" : ""}
              />
              <StatCard label="Não executados" value={batch.skipped} />
              <StatCard label="Cancelados" value={batch.cancelled} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <StatCard label="Imóveis nos XML" value={batch.total_properties} />
              <StatCard
                label="Imóveis válidos"
                value={batch.valid_properties}
                className="text-success"
              />
              <StatCard
                label="Imóveis inválidos"
                value={batch.invalid_properties}
                className={
                  batch.invalid_properties > 0 ? "text-destructive" : ""
                }
              />
            </div>
            {batch.error_message && (
              <details className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
                <summary className="cursor-pointer px-3 py-2 font-medium text-destructive">
                  Falhas do lote
                </summary>
                <pre className="max-h-48 overflow-auto border-t px-3 py-2 text-xs whitespace-pre-wrap">
                  {batch.error_message}
                </pre>
              </details>
            )}
          </SecaoDetalhe>
        )}

        <section className="flex flex-col">
          <header className="mb-3">
            <h2 className="font-semibold">Anunciantes</h2>
            <p className="text-sm text-muted-foreground">
              Como foi a importação de cada anunciante neste lote. Abra um
              anunciante para ver os erros de cada imóvel.
            </p>
          </header>
          <Toolbar
            placeholder="Buscar anunciante…"
            filtros={[
              {
                nome: "status",
                rotulo: "Status",
                opcoes: Object.entries(RUN_STATUS_LABEL).map(
                  ([value, label]) => ({ value, label }),
                ),
              },
            ]}
          />
          <RunsTable
            runs={runs.results}
            ordering={runParams.ordering as string}
            canDelete={pode(session, "xml_import_run", "delete")}
            revalidatePath={`/importacoes/lotes/${batch.id}`}
            empty={{
              titulo: active
                ? "Nenhum anunciante processado ainda"
                : "Nenhum anunciante encontrado",
              descricao: active
                ? "Os anunciantes aparecem aqui conforme o lote avança."
                : "Ajuste a busca ou o filtro de status.",
            }}
          />
          <PaginationBar pagina={runs} />
        </section>
      </div>
    </>
  );
}
