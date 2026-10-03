import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { StatusTarefaBadge } from "@/features/tarefas/status-tarefa";
import { STATUS_TAREFA, type TarefaLista } from "@/features/tarefas/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Tarefas agendadas" };

export default async function TarefasPage({ searchParams }: PageProps<"/tarefas">) {
  const sessao = await requirePermissao("scheduled_task_run");
  const params = paramsDeBusca(await searchParams, ["status", "name", "started_at__gte", "started_at__lte"], { ordering: "-started_at" });
  const pagina = await recurso.listar<TarefaLista>("scheduled-task-runs", params);

  return (
    <>
      <PageHeader
        titulo="Tarefas agendadas"
        descricao="Histórico de execução dos jobs do cron (importações, limpezas, envios)."
        crumbs={[{ label: "Tarefas agendadas" }]}
      />
      <Toolbar
        placeholder="Buscar por nome ou detalhes…"
        filtros={[{ nome: "status", rotulo: "Status", opcoes: Object.entries(STATUS_TAREFA).map(([value, label]) => ({ value, label })) }]}
      >
        <FiltroPeriodo campo="started_at" />
      </Toolbar>
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Tarefa", ordenavel: "name", render: (t) => <Link href={`/tarefas/${t.id}`} className="font-medium hover:underline">{t.name}</Link> },
          { chave: "status", titulo: "Status", ordenavel: "status", render: (t) => <StatusTarefaBadge status={t.status} /> },
          { chave: "started_at", titulo: "Início", ordenavel: "started_at", render: (t) => formatarData(t.started_at, true) },
          { chave: "finished_at", titulo: "Término", ordenavel: "finished_at", render: (t) => formatarData(t.finished_at, true) },
        ]}
        acoes={(t) => (
          <RowActions
            id={t.id}
            recurso="scheduled-task-runs"
            rotulo={`a execução de "${t.name}" em ${formatarData(t.started_at, true)}`}
            revalidar={["/tarefas"]}
            podeExcluir={pode(sessao, "scheduled_task_run", "delete")}
            extras={<AcaoVer href={`/tarefas/${t.id}`} />}
          />
        )}
        vazio={{ titulo: "Nenhuma execução registrada", descricao: "Os registros são gravados automaticamente pelos jobs agendados." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
