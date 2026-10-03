import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_TAREFA, type StatusTarefa } from "./types";

const ESTILOS: Record<StatusTarefa, string> = {
  RUNNING: "border-warning/40 text-warning",
  SUCCESS: "border-success/30 text-success",
  FAILED: "border-destructive/40 text-destructive",
};

const PONTOS: Record<StatusTarefa, string> = {
  RUNNING: "bg-warning animate-pulse",
  SUCCESS: "bg-success",
  FAILED: "bg-destructive",
};

export function StatusTarefaBadge({ status }: { status: StatusTarefa }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", ESTILOS[status] ?? "text-muted-foreground")}>
      <span className={cn("size-1.5 rounded-full", PONTOS[status] ?? "bg-muted-foreground/50")} aria-hidden />
      {STATUS_TAREFA[status] ?? status}
    </Badge>
  );
}
