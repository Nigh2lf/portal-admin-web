import { Inbox } from "lucide-react";

export function EmptyState({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" aria-hidden />
      </div>
      <p className="font-medium">{titulo}</p>
      {descricao && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
