import { PageHeader } from "@/components/layout/page-header";
import { ImovelForm } from "@/features/imoveis/imovel-form";
import { recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo imóvel" };

export default async function NovoImovelPage() {
  await requirePermissao("property", "create");
  const [doImovel, doCondominio] = await Promise.all([
    recurso.lookup("features", { scope: "PROPERTY" }).catch(() => [] as LookupOption[]),
    recurso.lookup("features", { scope: "CONDOMINIUM" }).catch(() => [] as LookupOption[]),
  ]);
  return (
    <>
      <PageHeader titulo="Novo imóvel" crumbs={[{ label: "Imóveis", href: "/imoveis" }, { label: "Novo" }]} />
      <ImovelForm imovel={null} caracteristicasImovel={doImovel} caracteristicasCondominio={doCondominio} />
    </>
  );
}
