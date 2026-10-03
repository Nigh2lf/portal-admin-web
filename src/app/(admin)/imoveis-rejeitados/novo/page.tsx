import { PageHeader } from "@/components/layout/page-header";
import { ImovelRejeitadoForm } from "@/features/imoveis-rejeitados/imovel-rejeitado-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Nova rejeição" };

export default async function NovoImovelRejeitadoPage() {
  await requirePermissao("rejected_property", "create");
  return (
    <>
      <PageHeader titulo="Nova rejeição" crumbs={[{ label: "Imóveis rejeitados", href: "/imoveis-rejeitados" }, { label: "Novo" }]} />
      <ImovelRejeitadoForm registro={null} />
    </>
  );
}
