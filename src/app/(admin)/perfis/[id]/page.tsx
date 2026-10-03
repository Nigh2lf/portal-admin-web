import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PerfilForm } from "@/features/perfis/perfil-form";
import type { MenuComPermissoes, PerfilDetalhe } from "@/features/perfis/types";
import { ApiError, apiFetch } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar perfil" };

export default async function EditarPerfilPage({ params }: PageProps<"/perfis/[id]">) {
  await requirePermissao("profile", "update");
  const { id } = await params;
  const [perfil, menus] = await Promise.all([
    recurso.obter<PerfilDetalhe>("profiles", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    apiFetch<MenuComPermissoes[]>("/profiles/menus-permissions/"),
  ]);
  if (!perfil) notFound();
  return (
    <>
      <PageHeader titulo={perfil.name} crumbs={[{ label: "Perfis de acesso", href: "/perfis" }, { label: "Editar" }]} />
      <PerfilForm perfil={perfil} menus={menus} />
    </>
  );
}
