import { PageHeader } from "@/components/layout/page-header";
import { PostForm } from "@/features/blog/post-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo post" };

export default async function NovoPostPage() {
  await requirePermissao("blog_post", "create");
  return (
    <>
      <PageHeader titulo="Novo post" crumbs={[{ label: "Blog", href: "/blog" }, { label: "Novo" }]} />
      <PostForm post={null} />
    </>
  );
}
