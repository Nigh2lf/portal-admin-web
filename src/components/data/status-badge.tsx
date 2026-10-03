import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ ativo, rotulos = ["Ativo", "Inativo"] }: { ativo: boolean; rotulos?: [string, string] }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", ativo ? "border-success/30 text-success" : "text-muted-foreground")}>
      <span className={cn("size-1.5 rounded-full", ativo ? "bg-success" : "bg-muted-foreground/50")} aria-hidden />
      {ativo ? rotulos[0] : rotulos[1]}
    </Badge>
  );
}
