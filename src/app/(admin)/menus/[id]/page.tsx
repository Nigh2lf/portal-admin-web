import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MenuForm } from "@/features/menus/menu-form";
import type { MenuItemDetalhe } from "@/features/menus/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar item de menu" };

export default async function EditarMenuPage({ params }: PageProps<"/menus/[id]">) {
  await requirePermissao("portal_menu_item", "update");
  const { id } = await params;
  const item = await recurso.obter<MenuItemDetalhe>("portal-menu-items", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!item) notFound();
  return (
    <>
      <PageHeader titulo={item.label} descricao={`${item.portal_name} · ${item.path}`} crumbs={[{ label: "Menus do site", href: "/menus" }, { label: "Editar" }]} />
      <MenuForm item={item} />
    </>
  );
}
