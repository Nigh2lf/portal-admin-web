import { PageHeader } from "@/components/layout/page-header";
import { EspacoForm } from "@/features/espacos-publicitarios/espaco-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo espaço publicitário" };

export default async function NovoEspacoPage() {
  await requirePermissao("ad_placement", "create");
  return (
    <>
      <PageHeader titulo="Novo espaço publicitário" crumbs={[{ label: "Espaços publicitários", href: "/espacos-publicitarios" }, { label: "Novo" }]} />
      <EspacoForm espaco={null} />
    </>
  );
}
