export type StatusTarefa = "RUNNING" | "SUCCESS" | "FAILED";

export interface TarefaLista {
  id: string;
  name: string;
  status: StatusTarefa;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

export interface TarefaDetalhe extends TarefaLista {
  details: string;
  legacy_id: number | null;
  updated_at: string;
}

export const STATUS_TAREFA: Record<StatusTarefa, string> = { RUNNING: "Executando", SUCCESS: "Sucesso", FAILED: "Falhou" };
