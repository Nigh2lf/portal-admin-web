import { PageHeader } from "@/components/layout/page-header";
import { MenuForm } from "@/features/menus/menu-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo item de menu" };

export default async function NovoMenuPage({ searchParams }: PageProps<"/menus/novo">) {
  await requirePermissao("portal_menu_item", "create");
  const sp = await searchParams;
  return (
    <>
      <PageHeader titulo="Novo item de menu" crumbs={[{ label: "Menus do site", href: "/menus" }, { label: "Novo" }]} />
      <MenuForm item={null} portalInicial={typeof sp.portal === "string" ? sp.portal : undefined} />
    </>
  );
}
