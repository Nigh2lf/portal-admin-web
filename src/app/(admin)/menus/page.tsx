import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BotoesReordenar } from "@/features/menus/reordenar";
import type { MenuItemLista } from "@/features/menus/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Menus do site" };

export default async function MenusPage({ searchParams }: PageProps<"/menus">) {
  const sessao = await requirePermissao("portal_menu_item");
  const sp = await searchParams;
  const portais = await recurso.lookup("portals").catch(() => []);
  const portalSelecionado = (typeof sp.portal === "string" && sp.portal) || portais[0]?.key || "";
  const params = paramsDeBusca({ ...sp, portal: portalSelecionado }, ["portal", "is_active"], { ordering: "sort_order", page_size: 100 });
  const pagina = portalSelecionado ? await recurso.listar<MenuItemLista>("portal-menu-items", params) : { results: [], count: 0, page: 1, page_size: 100, total_pages: 1, next: null, previous: null };
  const ids = pagina.results.map((m) => m.id);
  const podeReordenar = pode(sessao, "portal_menu_item", "create") && !sp.search && !sp.is_active && params.ordering === "sort_order";

  return (
    <>
      <PageHeader
        titulo="Menus do site"
        descricao="Itens do cabeçalho de cada portal. A ordem aqui é a ordem no site."
        crumbs={[{ label: "Menus do site" }]}
        acoes={pode(sessao, "portal_menu_item", "create") && (
          <Button asChild><Link href={`/menus/novo?portal=${portalSelecionado}`}><Plus data-icon="inline-start" /> Novo item</Link></Button>
        )}
      />
      <Toolbar
        placeholder="Buscar por rótulo ou caminho…"
        filtros={[
          { nome: "portal", rotulo: "Portal", opcoes: portais.map((p) => ({ value: p.key, label: p.value })) },
          { nome: "is_active", rotulo: "Status", opcoes: [{ value: "true", label: "Visíveis" }, { value: "false", label: "Ocultos" }] },
        ]}
      />
      {!podeReordenar && pagina.results.length > 0 && (
        <Alert className="mb-4"><AlertDescription>Para reordenar, limpe a busca e os filtros de status.</AlertDescription></Alert>
      )}
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "ordem", titulo: "Ordem", className: "w-28", render: (m) => (
            <span className="inline-flex items-center gap-2">
              <span className="w-5 text-right tabular-nums text-muted-foreground">{m.sort_order + 1}</span>
              {podeReordenar && <BotoesReordenar ids={ids} indice={ids.indexOf(m.id)} />}
            </span>
          ) },
          { chave: "label", titulo: "Rótulo", render: (m) => <Link href={`/menus/${m.id}`} className="font-medium hover:underline">{m.label}</Link> },
          { chave: "path", titulo: "Caminho", render: (m) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{m.path}</code> },
          { chave: "portal_name", titulo: "Portal" },
          { chave: "is_active", titulo: "Status", render: (m) => <StatusBadge ativo={m.is_active} rotulos={["Visível", "Oculto"]} /> },
        ]}
        acoes={(m) => (
          <RowActions id={m.id} editarHref={`/menus/${m.id}`} recurso="portal-menu-items" rotulo={`o item ${m.label}`} revalidar={["/menus"]} podeEditar={pode(sessao, "portal_menu_item", "update")} podeExcluir={pode(sessao, "portal_menu_item", "delete")} />
        )}
        vazio={{ titulo: "Este portal ainda não tem itens de menu", descricao: "Crie os itens ou rode `python manage.py seed_menus` na API para o menu padrão." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
