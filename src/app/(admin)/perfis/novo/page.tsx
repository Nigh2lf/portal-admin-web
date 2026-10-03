import { PageHeader } from "@/components/layout/page-header";
import { PerfilForm } from "@/features/perfis/perfil-form";
import type { MenuComPermissoes } from "@/features/perfis/types";
import { apiFetch } from "@/lib/api/client";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo perfil" };

export default async function NovoPerfilPage() {
  await requirePermissao("profile", "create");
  const menus = await apiFetch<MenuComPermissoes[]>("/profiles/menus-permissions/");
  return (
    <>
      <PageHeader titulo="Novo perfil" crumbs={[{ label: "Perfis de acesso", href: "/perfis" }, { label: "Novo" }]} />
      <PerfilForm perfil={null} menus={menus} />
    </>
  );
}
