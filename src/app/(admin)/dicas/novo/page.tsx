import { PageHeader } from "@/components/layout/page-header";
import { DicaForm } from "@/features/dicas/dica-form";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Nova dica" };

export default async function NovaDicaPage() {
  await requirePermissao("tip", "create");
  return (
    <>
      <PageHeader titulo="Nova dica" crumbs={[{ label: "Dicas", href: "/dicas" }, { label: "Nova" }]} />
      <DicaForm dica={null} />
    </>
  );
}
