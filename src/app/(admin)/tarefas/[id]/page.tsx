import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe } from "@/features/compartilhado/detalhe";
import { StatusTarefaBadge } from "@/features/tarefas/status-tarefa";
import { STATUS_TAREFA, type TarefaDetalhe } from "@/features/tarefas/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Tarefa agendada" };

export default async function TarefaPage({ params }: PageProps<"/tarefas/[id]">) {
  const sessao = await requirePermissao("scheduled_task_run");
  const { id } = await params;
  const t = await recurso.obter<TarefaDetalhe>("scheduled-task-runs", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!t) notFound();

  return (
    <>
      <PageHeader
        titulo={t.name}
        descricao={`${STATUS_TAREFA[t.status] ?? t.status} · iniciada em ${formatarData(t.started_at, true)}`}
        crumbs={[{ label: "Tarefas agendadas", href: "/tarefas" }, { label: "Detalhe" }]}
        acoes={pode(sessao, "scheduled_task_run", "delete") && <BotaoExcluir recurso="scheduled-task-runs" id={t.id} rotulo={`a execução de "${t.name}"`} voltarHref="/tarefas" />}
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <SecaoDetalhe titulo="Execução">
          <ListaDetalhe
            itens={[
              { rotulo: "Tarefa", valor: <span className="font-mono">{t.name}</span> },
              { rotulo: "Status", valor: <StatusTarefaBadge status={t.status} /> },
              { rotulo: "Início", valor: formatarData(t.started_at, true) },
              { rotulo: "Término", valor: t.finished_at ? formatarData(t.finished_at, true) : "Em andamento" },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Detalhes" descricao="Saída registrada pelo job.">
          {t.details ? (
            <pre className="max-h-[32rem] overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap break-words">{t.details}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Sem detalhes registrados.</p>
          )}
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "ID legado", valor: t.legacy_id },
              { rotulo: "Registrada em", valor: formatarData(t.created_at, true) },
              { rotulo: "Atualizada em", valor: formatarData(t.updated_at, true) },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}
