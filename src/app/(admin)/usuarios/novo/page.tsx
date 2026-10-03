import { PageHeader } from "@/components/layout/page-header";
import { UsuarioForm } from "@/features/usuarios/usuario-form";
import { apiFetch } from "@/lib/api/client";
import type { LookupOption } from "@/lib/api/types";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo usuário" };

export default async function NovoUsuarioPage() {
  await requirePermissao("user", "create");
  const perfis = await apiFetch<LookupOption[]>("/users/lookup-profile/").catch(() => []);
  return (
    <>
      <PageHeader titulo="Novo usuário" crumbs={[{ label: "Usuários", href: "/usuarios" }, { label: "Novo" }]} />
      <UsuarioForm usuario={null} perfis={perfis} />
    </>
  );
}
