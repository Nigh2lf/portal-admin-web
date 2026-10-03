import { AnuncianteForm } from "@/features/anunciantes/anunciante-form";
import { PageHeader } from "@/components/layout/page-header";
import { recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo anunciante" };

export default async function NovoAnunciantePage() {
  await requirePermissao("advertiser", "create");
  const cidades = await recurso.lookup("cities").catch(() => [] as LookupOption[]);
  return (
    <>
      <PageHeader titulo="Novo anunciante" crumbs={[{ label: "Anunciantes", href: "/anunciantes" }, { label: "Novo" }]} />
      <AnuncianteForm anunciante={null} cidades={cidades} />
    </>
  );
}
