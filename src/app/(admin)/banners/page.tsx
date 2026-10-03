import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { BannerLista } from "@/features/banners/types";
import { FILTRO_STATUS, opcoesDeLookup } from "@/features/comum/helpers";
import { urlMidia } from "@/features/comum/midia";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Banners do hero" };

function Miniatura({ url }: { url: string | null }) {
  const src = urlMidia(url);
  return (
    <span className="flex h-10 w-20 items-center justify-center overflow-hidden rounded border bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}

export default async function BannersPage({ searchParams }: PageProps<"/banners">) {
  const sessao = await requirePermissao("banner");
  const params = paramsDeBusca(await searchParams, ["portal", "is_active"], { ordering: "-created_at" });
  const [pagina, portais] = await Promise.all([recurso.listar<BannerLista>("banners", params), recurso.lookup("portals").catch(() => [])]);
  const botaoNovo = pode(sessao, "banner", "create") ? (
    <Button asChild>
      <Link href="/banners/novo"><Plus data-icon="inline-start" /> Novo banner</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Banners do hero" descricao="Imagens de fundo da home e das páginas internas de cada portal." crumbs={[{ label: "Banners do hero" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por portal…" filtros={[{ nome: "portal", rotulo: "Portal", opcoes: opcoesDeLookup(portais) }, FILTRO_STATUS]} />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "home_image_url", titulo: "Home", className: "w-24", render: (b) => <Link href={`/banners/${b.id}`}><Miniatura url={b.home_image_url} /></Link> },
          { chave: "inner_image_url", titulo: "Internas", className: "w-24", render: (b) => <Miniatura url={b.inner_image_url} /> },
          { chave: "portal_name", titulo: "Portal", render: (b) => <Link href={`/banners/${b.id}`} className="font-medium hover:underline">{b.portal_name ?? "Todos os portais"}</Link> },
          { chave: "is_active", titulo: "Status", ordenavel: "is_active", render: (b) => <StatusBadge ativo={b.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (b) => formatarData(b.created_at) },
        ]}
        acoes={(b) => (
          <RowActions
            id={b.id}
            editarHref={`/banners/${b.id}`}
            recurso="banners"
            rotulo={`o banner de ${b.portal_name ?? "todos os portais"}`}
            revalidar={["/banners"]}
            podeEditar={pode(sessao, "banner", "update")}
            podeExcluir={pode(sessao, "banner", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum banner encontrado", descricao: "Cadastre as imagens de fundo do hero.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
