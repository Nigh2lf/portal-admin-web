import { PageHeader } from "@/components/layout/page-header";
import { IntegradorForm } from "@/features/integradores/integrador-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo integrador" };

export default async function NovoIntegradorPage() {
  await requirePermissao("integrator", "create");
  return (
    <>
      <PageHeader titulo="Novo integrador" crumbs={[{ label: "Integradores", href: "/integradores" }, { label: "Novo" }]} />
      <IntegradorForm integrador={null} />
    </>
  );
}
