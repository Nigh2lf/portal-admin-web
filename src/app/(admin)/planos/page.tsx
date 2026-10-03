import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FILTRO_STATUS } from "@/features/comum/helpers";
import type { PlanoLista } from "@/features/planos/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarMoeda, formatarNumero } from "@/lib/utils/format";

export const metadata = { title: "Planos" };

export default async function PlanosPage({ searchParams }: PageProps<"/planos">) {
  const sessao = await requirePermissao("plan");
  const params = paramsDeBusca(await searchParams, ["is_active", "is_recommended", "is_owner_only"], { ordering: "sort_order" });
  const pagina = await recurso.listar<PlanoLista>("plans", params);
  const botaoNovo = pode(sessao, "plan", "create") ? (
    <Button asChild>
      <Link href="/planos/novo"><Plus data-icon="inline-start" /> Novo plano</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Planos" descricao="Planos contratados pelos anunciantes, com limites e recursos." crumbs={[{ label: "Planos" }]} acoes={botaoNovo} />
      <Toolbar
        placeholder="Buscar por nome ou slug…"
        filtros={[
          FILTRO_STATUS,
          { nome: "is_recommended", rotulo: "Recomendado", opcoes: [{ value: "true", label: "Recomendados" }, { value: "false", label: "Não recomendados" }] },
          { nome: "is_owner_only", rotulo: "Público", opcoes: [{ value: "true", label: "Só proprietários" }, { value: "false", label: "Imobiliárias" }] },
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "sort_order", titulo: "#", ordenavel: "sort_order", className: "w-14 text-muted-foreground", render: (p) => p.sort_order },
          {
            chave: "name",
            titulo: "Nome",
            ordenavel: "name",
            render: (p) => (
              <span className="flex items-center gap-2">
                <Link href={`/planos/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                {p.is_recommended && <Badge variant="default" className="gap-1"><Star className="size-3" aria-hidden /> Recomendado</Badge>}
              </span>
            ),
          },
          { chave: "slug", titulo: "Slug", render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.slug}</span> },
          { chave: "monthly_price", titulo: "Mensalidade", ordenavel: "monthly_price", render: (p) => (p.monthly_price === null ? <span className="text-muted-foreground">Sob consulta</span> : formatarMoeda(p.monthly_price)) },
          { chave: "property_limit", titulo: "Imóveis", className: "text-right", render: (p) => formatarNumero(p.property_limit) },
          { chave: "photo_limit", titulo: "Fotos", className: "text-right", render: (p) => formatarNumero(p.photo_limit) },
          { chave: "featured_limit", titulo: "Destaques", className: "text-right", render: (p) => formatarNumero(p.featured_limit) },
          { chave: "is_active", titulo: "Status", render: (p) => <StatusBadge ativo={p.is_active} /> },
        ]}
        acoes={(p) => (
          <RowActions
            id={p.id}
            editarHref={`/planos/${p.id}`}
            recurso="plans"
            rotulo={`o plano ${p.name}`}
            revalidar={["/planos"]}
            podeEditar={pode(sessao, "plan", "update")}
            podeExcluir={pode(sessao, "plan", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum plano encontrado", descricao: "Cadastre os planos oferecidos aos anunciantes.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
