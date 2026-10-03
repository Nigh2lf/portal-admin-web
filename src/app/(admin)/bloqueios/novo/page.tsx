import { PageHeader } from "@/components/layout/page-header";
import { BloqueioForm } from "@/features/bloqueios/bloqueio-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo bloqueio" };

export default async function NovoBloqueioPage() {
  await requirePermissao("blocked_sender", "create");
  return (
    <>
      <PageHeader titulo="Novo bloqueio" crumbs={[{ label: "Remetentes bloqueados", href: "/bloqueios" }, { label: "Novo" }]} />
      <BloqueioForm bloqueio={null} />
    </>
  );
}
