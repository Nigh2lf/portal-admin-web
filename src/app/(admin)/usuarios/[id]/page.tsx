import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import type { UsuarioDetalhe } from "@/features/usuarios/types";
import { UsuarioForm } from "@/features/usuarios/usuario-form";
import { ApiError, apiFetch } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar usuário" };

export default async function EditarUsuarioPage({ params }: PageProps<"/usuarios/[id]">) {
  await requirePermissao("user", "update");
  const { id } = await params;
  const [usuario, perfis] = await Promise.all([
    recurso.obter<UsuarioDetalhe>("users", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    apiFetch<LookupOption[]>("/users/lookup-profile/").catch(() => []),
  ]);
  if (!usuario) notFound();
  return (
    <>
      <PageHeader titulo={usuario.name || usuario.email} descricao={usuario.email} crumbs={[{ label: "Usuários", href: "/usuarios" }, { label: "Editar" }]} />
      <UsuarioForm usuario={usuario} perfis={perfis} />
    </>
  );
}
