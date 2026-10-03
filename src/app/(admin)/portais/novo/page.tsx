import { PageHeader } from "@/components/layout/page-header";
import { PortalForm } from "@/features/portais/portal-form";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo portal" };

export default async function NovoPortalPage() {
  await requirePermissao("portal", "create");
  const [cidades, portais] = await Promise.all([recurso.lookup("cities").catch(() => []), recurso.lookup("portals").catch(() => [])]);
  return (
    <>
      <PageHeader titulo="Novo portal" crumbs={[{ label: "Portais", href: "/portais" }, { label: "Novo" }]} />
      <PortalForm portal={null} cidades={cidades} portais={portais} />
    </>
  );
}
