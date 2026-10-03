import { cn } from "@/lib/utils";

export interface ItemDetalhe {
  rotulo: string;
  valor: React.ReactNode;
  /** Ocupa a linha inteira na grade. */
  largo?: boolean;
}

/** Seção de página de detalhe (somente leitura), no mesmo visual de `FormSecao`. */
export function SecaoDetalhe({ titulo, descricao, children, className }: { titulo: string; descricao?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5", className)}>
      <header className="mb-4">
        <h2 className="font-semibold">{titulo}</h2>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </header>
      {children}
    </section>
  );
}

/** Lista rótulo/valor em grade de duas colunas; valores vazios viram "—". */
export function ListaDetalhe({ itens }: { itens: ItemDetalhe[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {itens.map((i) => (
        <div key={i.rotulo} className={cn("flex flex-col gap-0.5", i.largo && "sm:col-span-2")}>
          <dt className="text-xs font-medium text-muted-foreground">{i.rotulo}</dt>
          <dd className="break-words">{i.valor === null || i.valor === undefined || i.valor === "" ? "—" : i.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Texto longo (mensagem, detalhes) preservando quebras de linha. */
export function TextoLongo({ texto, vazio = "Sem conteúdo." }: { texto: string | null | undefined; vazio?: string }) {
  if (!texto) return <p className="text-sm text-muted-foreground">{vazio}</p>;
  return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{texto}</p>;
}
