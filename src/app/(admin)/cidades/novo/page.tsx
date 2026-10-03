import { PageHeader } from "@/components/layout/page-header";
import { CidadeForm } from "@/features/cidades/cidade-form";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Nova cidade" };

export default async function NovaCidadePage() {
  await requirePermissao("city", "create");
  const estados = await recurso.lookup("states").catch(() => []);
  return (
    <>
      <PageHeader titulo="Nova cidade" crumbs={[{ label: "Cidades", href: "/cidades" }, { label: "Nova" }]} />
      <CidadeForm cidade={null} estados={estados} />
    </>
  );
}
