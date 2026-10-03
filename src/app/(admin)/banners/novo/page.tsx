import { PageHeader } from "@/components/layout/page-header";
import { BannerForm } from "@/features/banners/banner-form";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo banner" };

export default async function NovoBannerPage() {
  await requirePermissao("banner", "create");
  const portais = await recurso.lookup("portals").catch(() => []);
  return (
    <>
      <PageHeader titulo="Novo banner" crumbs={[{ label: "Banners do hero", href: "/banners" }, { label: "Novo" }]} />
      <BannerForm banner={null} portais={portais} />
    </>
  );
}
