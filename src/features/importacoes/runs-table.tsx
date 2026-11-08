import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { formatDuration } from "./format";
import { RunStatusBadge } from "./status-badges";
import type { ImportacaoLista } from "./types";

interface Props {
  runs: ImportacaoLista[];
  ordering?: string;
  canDelete: boolean;
  /** Página que a exclusão de uma execução revalida. */
  revalidatePath: string;
  empty: { titulo: string; descricao?: string };
}

/** Execuções da importação, uma por anunciante, com link para o detalhe e os erros de cada imóvel. */
export function RunsTable({
  runs,
  ordering,
  canDelete,
  revalidatePath,
  empty,
}: Props) {
  return (
    <DataTable
      linhas={runs}
      ordenacaoAtual={ordering}
      colunas={[
        {
          chave: "advertiser_name",
          titulo: "Anunciante",
          ordenavel: "advertiser__name",
          render: (r) => (
            <div className="flex max-w-md flex-col gap-0.5">
              <Link
                href={`/importacoes/${r.id}`}
                className="font-medium hover:underline"
              >
                {r.advertiser_name}
              </Link>
              {r.error_message && (
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={r.error_message}
                >
                  {r.error_message}
                </span>
              )}
            </div>
          ),
        },
        {
          chave: "status",
          titulo: "Status",
          render: (r) => <RunStatusBadge status={r.status} />,
        },
        {
          chave: "started_at",
          titulo: "Início",
          ordenavel: "started_at",
          className: "whitespace-nowrap",
          render: (r) => formatarData(r.started_at, true),
        },
        {
          chave: "duration",
          titulo: "Duração",
          className: "whitespace-nowrap",
          render: (r) =>
            r.status === "SKIPPED" || r.status === "CANCELLED"
              ? "—"
              : formatDuration(r.started_at, r.finished_at),
        },
        {
          chave: "total_properties",
          titulo: "Imóveis",
          ordenavel: "total_properties",
          className: "text-right tabular-nums",
          render: (r) => formatarNumero(r.total_properties),
        },
        {
          chave: "valid_properties",
          titulo: "Válidos",
          ordenavel: "valid_properties",
          className: "text-right tabular-nums",
          render: (r) => (
            <span className="text-success">
              {formatarNumero(r.valid_properties)}
            </span>
          ),
        },
        {
          chave: "invalid_properties",
          titulo: "Inválidos",
          ordenavel: "invalid_properties",
          className: "text-right tabular-nums",
          render: (r) => (
            <span
              className={
                r.invalid_properties > 0 ? "font-medium text-destructive" : ""
              }
            >
              {formatarNumero(r.invalid_properties)}
            </span>
          ),
        },
        {
          chave: "report_email_sent",
          titulo: "Relatório",
          render: (r) => (
            <StatusBadge
              ativo={r.report_email_sent}
              rotulos={["Enviado", "Não enviado"]}
            />
          ),
        },
      ]}
      acoes={(r) => (
        <RowActions
          id={r.id}
          recurso="xml-import-runs"
          rotulo={`a importação de ${r.advertiser_name} em ${formatarData(r.started_at, true)}`}
          revalidar={[revalidatePath]}
          podeExcluir={canDelete}
          extras={<AcaoVer href={`/importacoes/${r.id}`} />}
        />
      )}
      vazio={empty}
    />
  );
}
