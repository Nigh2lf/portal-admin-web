import { PageHeader } from "@/components/layout/page-header";
import { PlanoForm } from "@/features/planos/plano-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo plano" };

export default async function NovoPlanoPage() {
  await requirePermissao("plan", "create");
  return (
    <>
      <PageHeader titulo="Novo plano" crumbs={[{ label: "Planos", href: "/planos" }, { label: "Novo" }]} />
      <PlanoForm plano={null} />
    </>
  );
}
