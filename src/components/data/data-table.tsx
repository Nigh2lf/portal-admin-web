import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { SortLink } from "./sort-link";

export interface Coluna<T> {
  chave: string;
  titulo: string;
  /** Campo aceito em `?ordering=`; ausente = não ordenável. */
  ordenavel?: string;
  className?: string;
  render?: (linha: T) => React.ReactNode;
}

interface Props<T extends { id: string }> {
  colunas: Coluna<T>[];
  linhas: T[];
  ordenacaoAtual?: string;
  vazio?: { titulo: string; descricao?: string; acao?: React.ReactNode };
  acoes?: (linha: T) => React.ReactNode;
}

/** Tabela server-rendered: ordenação e paginação via URL, ações por linha em client component. */
export function DataTable<T extends { id: string }>({ colunas, linhas, ordenacaoAtual, vazio, acoes }: Props<T>) {
  if (!linhas.length) {
    return <EmptyState titulo={vazio?.titulo ?? "Nenhum registro encontrado"} descricao={vazio?.descricao} acao={vazio?.acao} />;
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {colunas.map((c) => (
              <TableHead key={c.chave} className={cn("whitespace-nowrap", c.className)}>
                {c.ordenavel ? <SortLink campo={c.ordenavel} atual={ordenacaoAtual}>{c.titulo}</SortLink> : c.titulo}
              </TableHead>
            ))}
            {acoes && <TableHead className="w-12 text-right"><span className="sr-only">Ações</span></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((l) => (
            <TableRow key={l.id}>
              {colunas.map((c) => (
                <TableCell key={c.chave} className={cn("align-middle", c.className)}>
                  {c.render ? c.render(l) : String((l as Record<string, unknown>)[c.chave] ?? "—")}
                </TableCell>
              ))}
              {acoes && <TableCell className="text-right">{acoes(l)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
