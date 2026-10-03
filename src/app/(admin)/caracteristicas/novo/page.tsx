import { PageHeader } from "@/components/layout/page-header";
import { CaracteristicaForm } from "@/features/caracteristicas/caracteristica-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Nova característica" };

export default async function NovaCaracteristicaPage() {
  await requirePermissao("feature", "create");
  return (
    <>
      <PageHeader titulo="Nova característica" crumbs={[{ label: "Características", href: "/caracteristicas" }, { label: "Nova" }]} />
      <CaracteristicaForm caracteristica={null} />
    </>
  );
}
