import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: string;
  obrigatorio?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Rótulo + controle + erro/ajuda, com ids ligados para acessibilidade. */
export function Campo({ id, rotulo, erro, ajuda, obrigatorio, className, children }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
      </Label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-xs text-destructive" role="alert">{erro}</p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className="text-xs text-muted-foreground">{ajuda}</p>
      ) : null}
    </div>
  );
}

export function FormSecao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <header className="mb-4">
        <h2 className="font-semibold">{titulo}</h2>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
