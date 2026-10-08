import { Badge } from "@/components/ui/badge";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { CAMPOS_IMOVEL, type Simulacao } from "./types";

/** Resultado da simulação de um anunciante: números e listas do que mudaria. */
export function SimulationResult({ s }: { s: Simulacao }) {
  if (s.erro) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="font-medium text-destructive">A simulação falhou</p>
        <p className="mt-1">{s.erro}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatarData(s.gerado_em, true)}
        </p>
      </div>
    );
  }
  const numbers: Array<[string, number | undefined, string]> = [
    ["No XML", s.total_feed, ""],
    ["Novos", s.novos, "text-success"],
    ["Alterados", s.alterados, "text-warning"],
    ["Iguais", s.iguais, ""],
    ["Excluídos", s.excluidos, "text-destructive"],
    ["Ignorados", s.ignorados, "text-destructive"],
  ];
  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Resultado da simulação"
    >
      <p className="text-xs text-muted-foreground">
        Simulação de {formatarData(s.gerado_em, true)} · formato {s.formato}
      </p>
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {numbers.map(([label, n, color]) => (
          <div key={label} className="rounded-lg border p-2 text-center">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${color}`}>
              {formatarNumero(n ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <CodeList
        title="Alterados"
        items={s.codigos_alterados?.map((a) => ({
          key: a.codigo,
          text: a.campos.map((c) => CAMPOS_IMOVEL[c] ?? c).join(", "),
        }))}
      />
      <CodeList
        title="Ignorados"
        items={s.ignorados_lista?.map((i) => ({
          key: i.codigo || "(sem código)",
          text: i.motivo,
        }))}
      />
      <CodeList
        title="Excluídos (saíram do XML)"
        items={s.codigos_excluidos?.map((c) => ({ key: c, text: "" }))}
      />
      <CodeList
        title="Novos"
        items={s.codigos_novos?.map((c) => ({ key: c, text: "" }))}
      />
    </section>
  );
}

function CodeList({
  title,
  items,
}: {
  title: string;
  items?: Array<{ key: string; text: string }>;
}) {
  if (!items?.length) return null;
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
        {title} <Badge variant="secondary">{items.length}</Badge>
      </summary>
      <ul className="max-h-64 divide-y overflow-y-auto border-t text-sm">
        {items.map((i, idx) => (
          <li key={`${i.key}-${idx}`} className="flex gap-3 px-3 py-1.5">
            <span className="shrink-0 font-mono text-xs">{i.key}</span>
            {i.text && <span className="text-muted-foreground">{i.text}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}
