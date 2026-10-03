import { PageHeader } from "@/components/layout/page-header";
import { BairroForm } from "@/features/bairros/bairro-form";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo bairro" };

export default async function NovoBairroPage() {
  await requirePermissao("neighborhood", "create");
  const estados = await recurso.lookup("states").catch(() => []);
  return (
    <>
      <PageHeader titulo="Novo bairro" crumbs={[{ label: "Bairros", href: "/bairros" }, { label: "Novo" }]} />
      <BairroForm bairro={null} estados={estados} estadoInicial={null} />
    </>
  );
}
