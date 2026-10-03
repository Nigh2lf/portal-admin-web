import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NAV } from "@/config/nav";
import { recurso } from "@/lib/api/resources";
import { pode, requireSession } from "@/lib/auth/session";

const INDICADORES: Array<{ titulo: string; recurso: string; viewName: string; href: string }> = [
  { titulo: "Usuários", recurso: "users", viewName: "user", href: "/usuarios" },
  { titulo: "Anunciantes", recurso: "advertisers", viewName: "advertiser", href: "/anunciantes" },
  { titulo: "Imóveis", recurso: "properties", viewName: "property", href: "/imoveis" },
  { titulo: "Mensagens de imóveis", recurso: "property-inquiries", viewName: "property_inquiry", href: "/mensagens" },
  { titulo: "Encomendas", recurso: "property-requests", viewName: "property_request", href: "/encomendas" },
  { titulo: "Portais", recurso: "portals", viewName: "portal", href: "/portais" },
];

async function contar(path: string) {
  try {
    const r = await recurso.listar<{ id: string }>(path, { page_size: 1 });
    return r.count;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const sessao = await requireSession();
  const visiveis = INDICADORES.filter((i) => pode(sessao, i.viewName));
  const totais = await Promise.all(visiveis.map((i) => contar(i.recurso)));

  return (
    <>
      <PageHeader titulo={`Olá, ${sessao.name.split(" ")[0] || "admin"}`} descricao="Resumo dos portais de imóveis." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visiveis.map((i, k) => (
          <Card key={i.recurso}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{i.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <p className="text-3xl font-semibold tabular-nums">{totais[k] === null ? "—" : totais[k]!.toLocaleString("pt-BR")}</p>
              <Link href={i.href} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Ver <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Atalhos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NAV.flatMap((g) => g.itens)
            .filter((it) => pode(sessao, it.viewName))
            .map((it) => (
              <Link key={it.href} href={it.href} className="rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:bg-accent">
                {it.label}
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
