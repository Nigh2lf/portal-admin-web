import { cn } from "@/lib/utils";
import { formatarNumero } from "@/lib/utils/format";

/** Número em destaque com rótulo (contadores do lote e da execução). */
export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", className)}>
        {formatarNumero(value)}
      </p>
    </div>
  );
}
