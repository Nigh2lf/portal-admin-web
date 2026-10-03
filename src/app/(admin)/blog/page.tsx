import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { PostLista } from "@/features/blog/types";
import { filtroPortal } from "@/features/compartilhado/filtros";
import { urlMidia } from "@/features/compartilhado/midia";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Blog" };

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sessao = await requirePermissao("blog_post");
  const params = paramsDeBusca(await searchParams, ["portal", "is_published"], { ordering: "-published_at" });
  const [pagina, fPortal] = await Promise.all([recurso.listar<PostLista>("blog-posts", params), filtroPortal()]);

  return (
    <>
      <PageHeader
        titulo="Blog"
        descricao="Posts publicados nos portais. Sem portal, o post vale para todos."
        crumbs={[{ label: "Blog" }]}
        acoes={
          pode(sessao, "blog_post", "create") && (
            <Button asChild>
              <Link href="/blog/novo"><Plus data-icon="inline-start" /> Novo post</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por título, slug, resumo ou autor…"
        filtros={[fPortal, { nome: "is_published", rotulo: "Status", opcoes: [{ value: "true", label: "Publicados" }, { value: "false", label: "Rascunhos" }] }]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "cover_image_url",
            titulo: "Capa",
            className: "w-20",
            render: (p) =>
              p.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlMidia(p.cover_image_url) ?? undefined} alt="" className="h-10 w-16 rounded border object-cover" />
              ) : (
                <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed text-muted-foreground" aria-hidden>
                  <ImageOff className="size-4" />
                </div>
              ),
          },
          {
            chave: "title",
            titulo: "Título",
            ordenavel: "title",
            render: (p) => (
              <div className="flex flex-col">
                <Link href={`/blog/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span>
              </div>
            ),
          },
          { chave: "portal_name", titulo: "Portal", render: (p) => p.portal_name ?? <span className="text-muted-foreground">Todos</span> },
          { chave: "author_name", titulo: "Autor", render: (p) => p.author_name || "—" },
          { chave: "is_published", titulo: "Status", ordenavel: "is_published", render: (p) => <StatusBadge ativo={p.is_published} rotulos={["Publicado", "Rascunho"]} /> },
          { chave: "published_at", titulo: "Publicado em", ordenavel: "published_at", render: (p) => formatarData(p.published_at, true) },
        ]}
        acoes={(p) => (
          <RowActions
            id={p.id}
            editarHref={`/blog/${p.id}`}
            recurso="blog-posts"
            rotulo={`o post "${p.title}"`}
            revalidar={["/blog"]}
            podeEditar={pode(sessao, "blog_post", "update")}
            podeExcluir={pode(sessao, "blog_post", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum post cadastrado" }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}
