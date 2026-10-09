import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MetricRow {
  label: string;
  value: number;
  href?: string;
}

interface MetricCardProps {
  title: string;
  href: string;
  /** Total cadastrado; `null` quando a API não respondeu. */
  total: number | null;
  /** Parte "ativa" do total, mostrada em destaque com a barra de proporção. */
  active?: { value: number; label: string };
  rows?: MetricRow[];
}

const formatNumber = (n: number) => n.toLocaleString("pt-BR");

export function MetricCard({ title, href, total, active, rows = [] }: MetricCardProps) {
  const headline = active ? active.value : total;
  const share = active && total ? Math.round((active.value / total) * 100) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Ver <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-3xl font-semibold tabular-nums">{headline === null ? "—" : formatNumber(headline)}</p>
          <p className="text-sm text-muted-foreground">
            {active && total !== null ? (
              <>
                {active.label} · de <span className="font-medium text-foreground tabular-nums">{formatNumber(total)}</span> no total
              </>
            ) : (
              "no total"
            )}
          </p>
        </div>
        {active && share !== null ? (
          <div
            role="progressbar"
            aria-valuenow={share}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${share}% ${active.label}`}
            className="flex items-center gap-2"
          >
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
            </div>
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{share}%</span>
          </div>
        ) : null}
        {rows.length ? (
          <dl className="space-y-1.5 border-t pt-3 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">
                  {row.href ? (
                    <Link href={row.href} className="hover:text-foreground hover:underline">
                      {row.label}
                    </Link>
                  ) : (
                    row.label
                  )}
                </dt>
                <dd className="font-medium tabular-nums">{formatNumber(row.value)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}
