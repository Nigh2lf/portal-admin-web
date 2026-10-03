import { PageHeader } from "@/components/layout/page-header";
import { TipoImovelForm } from "@/features/tipos-de-imovel/tipo-imovel-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo tipo de imóvel" };

export default async function NovoTipoImovelPage() {
  await requirePermissao("property_type", "create");
  return (
    <>
      <PageHeader titulo="Novo tipo de imóvel" crumbs={[{ label: "Tipos de imóvel", href: "/tipos-de-imovel" }, { label: "Novo" }]} />
      <TipoImovelForm tipo={null} />
    </>
  );
}
