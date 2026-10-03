import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CidadeLista } from "@/features/cidades/types";
import { FILTRO_STATUS, opcoesDeLookup } from "@/features/comum/helpers";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Cidades" };

export default async function CidadesPage({ searchParams }: PageProps<"/cidades">) {
  const sessao = await requirePermissao("city");
  const params = paramsDeBusca(await searchParams, ["state", "is_active"], { ordering: "name" });
  const [pagina, estados] = await Promise.all([recurso.listar<CidadeLista>("cities", params), recurso.lookup("states").catch(() => [])]);
  const botaoNovo = pode(sessao, "city", "create") ? (
    <Button asChild>
      <Link href="/cidades/novo"><Plus data-icon="inline-start" /> Nova cidade</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Cidades" descricao="Cidades atendidas pelos portais e usadas nos imóveis." crumbs={[{ label: "Cidades" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por nome, slug ou UF…" filtros={[{ nome: "state", rotulo: "Estado", opcoes: opcoesDeLookup(estados) }, FILTRO_STATUS]} />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (c) => <Link href={`/cidades/${c.id}`} className="font-medium hover:underline">{c.name}</Link> },
          { chave: "state_code", titulo: "UF", ordenavel: "state__code", className: "w-20", render: (c) => <Badge variant="secondary" className="font-mono">{c.state_code}</Badge> },
          { chave: "slug", titulo: "Slug", ordenavel: "slug", render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span> },
          { chave: "is_active", titulo: "Status", render: (c) => <StatusBadge ativo={c.is_active} rotulos={["Ativa", "Inativa"]} /> },
          { chave: "created_at", titulo: "Criada em", ordenavel: "created_at", render: (c) => formatarData(c.created_at) },
        ]}
        acoes={(c) => (
          <RowActions
            id={c.id}
            editarHref={`/cidades/${c.id}`}
            recurso="cities"
            rotulo={`a cidade ${c.name}/${c.state_code}`}
            revalidar={["/cidades"]}
            podeEditar={pode(sessao, "city", "update")}
            podeExcluir={pode(sessao, "city", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhuma cidade encontrada", descricao: "Ajuste os filtros ou cadastre uma nova cidade.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
