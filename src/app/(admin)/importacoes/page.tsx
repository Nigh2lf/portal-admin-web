import Link from "next/link";
import { CloudDownload, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { filtroAnunciante } from "@/features/compartilhado/filtros";
import { AtualizarEnquantoRoda } from "@/features/importacoes/atualizar-enquanto-roda";
import { BatchProgress } from "@/features/importacoes/batch-progress";
import { formatDuration } from "@/features/importacoes/format";
import { BatchStatusBadge } from "@/features/importacoes/status-badges";
import {
  ACTIVE_BATCH_STATUSES,
  BATCH_ORIGIN_LABEL,
  BATCH_STATUS_LABEL,
  type ImportBatch,
  type ImportBatchDetail,
} from "@/features/importacoes/types";
import { apiFetch } from "@/lib/api/client";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarNumero } from "@/lib/utils/format";

export const metadata = { title: "Importações XML" };

const BATCH_FILTERS = [
  "advertiser",
  "status",
  "origin",
  "created_at__gte",
  "created_at__lte",
];

function batchSource(b: ImportBatch) {
  const who = b.created_by_name ? ` por ${b.created_by_name}` : "";
  const scope =
    b.scope === "ALL"
      ? "todos os anunciantes"
      : `${formatarNumero(b.total_advertisers)} escolhido(s)`;
  return `${BATCH_ORIGIN_LABEL[b.origin]}${who} · ${scope}`;
}

/** Contadores de anunciantes que não deram certo, só os diferentes de zero. */
function advertiserProblems(b: ImportBatch) {
  return (
    [
      [b.failed, "com falha", "text-destructive"],
      [b.skipped, "não executado(s)", ""],
      [b.cancelled, "cancelado(s)", ""],
    ] as Array<[number, string, string]>
  ).filter(([n]) => n > 0);
}

export default async function ImportBatchesPage({
  searchParams,
}: PageProps<"/importacoes">) {
  const session = await requirePermissao("xml_import_run");
  const params = paramsDeBusca(await searchParams, BATCH_FILTERS, {
    ordering: "-created_at",
  });
  const canImport = pode(session, "xml_import_run", "create");
  const [page, advertiserFilter, activeBatch] = await Promise.all([
    recurso.listar<ImportBatch>("xml-import-runs/batches", params),
    filtroAnunciante(),
    apiFetch<ImportBatchDetail | null>(
      "/xml-import-runs/batches/active/",
    ).catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        titulo="Importações XML"
        descricao="Cada importação roda os anunciantes em lote; abra uma para ver como foi cada anunciante. Roda sozinha toda noite, das 1h às 3h."
        crumbs={[{ label: "Importações XML" }]}
        acoes={
          <>
            <Button asChild variant="outline">
              <Link href="/importacoes/avulsas">
                <History data-icon="inline-start" /> Execuções avulsas
              </Link>
            </Button>
            {canImport && (
              <Button asChild>
                <Link href="/importacoes/importar">
                  <CloudDownload data-icon="inline-start" /> Importar agora
                </Link>
              </Button>
            )}
          </>
        }
      />
      <div className="mb-6">
        <BatchProgress initial={activeBatch} canCancel={canImport} />
      </div>
      <AtualizarEnquantoRoda
        ativo={
          !activeBatch &&
          page.results.some((b) => ACTIVE_BATCH_STATUSES.includes(b.status))
        }
      />
      <Toolbar
        placeholder="Buscar por anunciante…"
        filtros={[
          advertiserFilter,
          {
            nome: "status",
            rotulo: "Status",
            opcoes: Object.entries(BATCH_STATUS_LABEL).map(
              ([value, label]) => ({ value, label }),
            ),
          },
          {
            nome: "origin",
            rotulo: "Origem",
            opcoes: Object.entries(BATCH_ORIGIN_LABEL).map(
              ([value, label]) => ({ value, label }),
            ),
          },
        ]}
      >
        <FiltroPeriodo campo="created_at" />
      </Toolbar>
      <DataTable
        linhas={page.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "created_at",
            titulo: "Importação",
            ordenavel: "created_at",
            render: (b) => (
              <div className="flex flex-col gap-0.5">
                <Link
                  href={`/importacoes/lotes/${b.id}`}
                  className="font-medium whitespace-nowrap hover:underline"
                >
                  {formatarData(b.started_at ?? b.created_at, true)}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {batchSource(b)}
                </span>
              </div>
            ),
          },
          {
            chave: "status",
            titulo: "Status",
            render: (b) => (
              <span title={b.error_message || undefined}>
                <BatchStatusBadge status={b.status} />
              </span>
            ),
          },
          {
            chave: "advertisers",
            titulo: "Anunciantes",
            ordenavel: "total_advertisers",
            render: (b) => (
              <div className="flex flex-col gap-0.5">
                <span className="tabular-nums">
                  {formatarNumero(b.ok)} de{" "}
                  {formatarNumero(b.total_advertisers)} importados
                </span>
                {advertiserProblems(b).length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {advertiserProblems(b).map(([n, label, color], index) => (
                      <span key={label}>
                        {index > 0 && " · "}
                        <span className={color}>
                          {formatarNumero(n)} {label}
                        </span>
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ),
          },
          {
            chave: "duration",
            titulo: "Duração",
            className: "whitespace-nowrap",
            render: (b) => formatDuration(b.started_at, b.finished_at),
          },
          {
            chave: "total_properties",
            titulo: "Imóveis",
            className: "text-right tabular-nums",
            render: (b) => formatarNumero(b.total_properties),
          },
          {
            chave: "valid_properties",
            titulo: "Válidos",
            className: "text-right tabular-nums",
            render: (b) => (
              <span className="text-success">
                {formatarNumero(b.valid_properties)}
              </span>
            ),
          },
          {
            chave: "invalid_properties",
            titulo: "Inválidos",
            className: "text-right tabular-nums",
            render: (b) => (
              <span
                className={
                  b.invalid_properties > 0 ? "font-medium text-destructive" : ""
                }
              >
                {formatarNumero(b.invalid_properties)}
              </span>
            ),
          },
        ]}
        acoes={(b) => (
          <RowActions
            id={b.id}
            podeExcluir={false}
            extras={<AcaoVer href={`/importacoes/lotes/${b.id}`} />}
          />
        )}
        vazio={{
          titulo: "Nenhuma importação em lote",
          descricao:
            "Os lotes são criados pela importação noturna e pelo botão Importar agora. Execuções antigas, de antes dos lotes, ficam em Execuções avulsas.",
        }}
      />
      <PaginationBar pagina={page} />
    </>
  );
}
