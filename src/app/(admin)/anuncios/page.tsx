import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnuncioLista } from "@/features/anuncios/types";
import { FILTRO_STATUS, opcoesDeLookup } from "@/features/comum/helpers";
import { urlMidia } from "@/features/comum/midia";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Anúncios" };

export default async function AnunciosPage({ searchParams }: PageProps<"/anuncios">) {
  const sessao = await requirePermissao("ad");
  const params = paramsDeBusca(await searchParams, ["portal", "placement", "is_active"], { ordering: "-created_at" });
  const [pagina, portais, espacos] = await Promise.all([
    recurso.listar<AnuncioLista>("ads", params),
    recurso.lookup("portals").catch(() => []),
    recurso.lookup("ad-placements").catch(() => []),
  ]);
  const botaoNovo = pode(sessao, "ad", "create") ? (
    <Button asChild>
      <Link href="/anuncios/novo"><Plus data-icon="inline-start" /> Novo anúncio</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Anúncios" descricao="Peças publicitárias veiculadas nos espaços de cada portal." crumbs={[{ label: "Anúncios" }]} acoes={botaoNovo} />
      <Toolbar
        placeholder="Buscar por nome, link ou portal…"
        filtros={[
          { nome: "portal", rotulo: "Portal", opcoes: opcoesDeLookup(portais) },
          { nome: "placement", rotulo: "Espaço", opcoes: opcoesDeLookup(espacos) },
          FILTRO_STATUS,
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "image_url",
            titulo: "Imagem",
            className: "w-20",
            render: (a) => {
              const src = urlMidia(a.image_url);
              return (
                <span className="flex h-10 w-16 items-center justify-center overflow-hidden rounded border bg-muted">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-4 text-muted-foreground" aria-hidden />
                  )}
                </span>
              );
            },
          },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (a) => <Link href={`/anuncios/${a.id}`} className="font-medium hover:underline">{a.name}</Link> },
          { chave: "portal_name", titulo: "Portal" },
          { chave: "placement", titulo: "Espaço", render: (a) => <span className="flex items-center gap-2"><Badge variant="secondary" className="font-mono">{a.placement_code}</Badge>{a.placement_name}</span> },
          { chave: "starts_at", titulo: "Início", ordenavel: "starts_at", render: (a) => formatarData(a.starts_at, true) },
          { chave: "ends_at", titulo: "Fim", ordenavel: "ends_at", render: (a) => formatarData(a.ends_at, true) },
          { chave: "is_active", titulo: "Status", ordenavel: "is_active", render: (a) => <StatusBadge ativo={a.is_active} /> },
        ]}
        acoes={(a) => (
          <RowActions
            id={a.id}
            editarHref={`/anuncios/${a.id}`}
            recurso="ads"
            rotulo={`o anúncio ${a.name}`}
            revalidar={["/anuncios"]}
            podeEditar={pode(sessao, "ad", "update")}
            podeExcluir={pode(sessao, "ad", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum anúncio encontrado", descricao: "Ajuste os filtros ou cadastre um novo anúncio.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
