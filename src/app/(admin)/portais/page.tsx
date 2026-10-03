import Link from "next/link";
import { Globe, Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FILTRO_STATUS, opcoesDeLookup } from "@/features/comum/helpers";
import { urlMidia } from "@/features/comum/midia";
import type { PortalLista } from "@/features/portais/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Portais" };

export default async function PortaisPage({ searchParams }: PageProps<"/portais">) {
  const sessao = await requirePermissao("portal");
  const params = paramsDeBusca(await searchParams, ["is_active", "main_city"], { ordering: "name" });
  const [pagina, cidades] = await Promise.all([recurso.listar<PortalLista>("portals", params), recurso.lookup("cities").catch(() => [])]);
  const botaoNovo = pode(sessao, "portal", "create") ? (
    <Button asChild>
      <Link href="/portais/novo"><Plus data-icon="inline-start" /> Novo portal</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Portais" descricao="Sites de imóveis publicados, cada um com domínio, cidades e identidade próprios." crumbs={[{ label: "Portais" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por nome, slug ou domínio…" filtros={[{ nome: "main_city", rotulo: "Cidade principal", opcoes: opcoesDeLookup(cidades) }, FILTRO_STATUS]} />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "name",
            titulo: "Portal",
            ordenavel: "name",
            render: (p) => {
              const logo = urlMidia(p.logo_url);
              return (
                <span className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" className="size-full object-contain" />
                    ) : (
                      <Globe className="size-4 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                  <span className="flex flex-col">
                    <Link href={`/portais/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                    <span className="font-mono text-xs text-muted-foreground">{p.slug}</span>
                  </span>
                </span>
              );
            },
          },
          { chave: "domain", titulo: "Domínio", ordenavel: "domain", render: (p) => <a href={`https://${p.domain}`} target="_blank" rel="noreferrer" className="hover:underline">{p.domain}</a> },
          { chave: "main_city_name", titulo: "Cidade principal" },
          { chave: "email", titulo: "E-mail" },
          { chave: "is_active", titulo: "Status", render: (p) => <StatusBadge ativo={p.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (p) => formatarData(p.created_at) },
        ]}
        acoes={(p) => (
          <RowActions
            id={p.id}
            editarHref={`/portais/${p.id}`}
            recurso="portals"
            rotulo={`o portal ${p.name}`}
            revalidar={["/portais"]}
            podeEditar={pode(sessao, "portal", "update")}
            podeExcluir={pode(sessao, "portal", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum portal encontrado", descricao: "Cadastre o primeiro portal para começar a publicar imóveis.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
