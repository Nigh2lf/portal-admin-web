import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PostForm } from "@/features/blog/post-form";
import type { PostDetalhe } from "@/features/blog/types";
import { urlMidia } from "@/features/compartilhado/midia";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar post" };

export default async function EditarPostPage({ params }: PageProps<"/blog/[id]">) {
  await requirePermissao("blog_post", "update");
  const { id } = await params;
  const post = await recurso.obter<PostDetalhe>("blog-posts", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!post) notFound();
  return (
    <>
      <PageHeader titulo={post.title} descricao={`/${post.slug}`} crumbs={[{ label: "Blog", href: "/blog" }, { label: "Editar" }]} />
      {/* A API devolve a capa como caminho relativo; resolvemos no servidor antes de ir ao client. */}
      <PostForm post={{ ...post, cover_image_url: urlMidia(post.cover_image_url) }} />
    </>
  );
}
