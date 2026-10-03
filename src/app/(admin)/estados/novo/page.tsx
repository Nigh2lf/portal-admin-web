import { PageHeader } from "@/components/layout/page-header";
import { EstadoForm } from "@/features/estados/estado-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo estado" };

export default async function NovoEstadoPage() {
  await requirePermissao("state", "create");
  return (
    <>
      <PageHeader titulo="Novo estado" crumbs={[{ label: "Estados", href: "/estados" }, { label: "Novo" }]} />
      <EstadoForm estado={null} />
    </>
  );
}
