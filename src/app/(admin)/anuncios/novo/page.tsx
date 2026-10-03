import { PageHeader } from "@/components/layout/page-header";
import { AnuncioForm } from "@/features/anuncios/anuncio-form";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Novo anúncio" };

export default async function NovoAnuncioPage() {
  await requirePermissao("ad", "create");
  const [portais, espacos] = await Promise.all([recurso.lookup("portals").catch(() => []), recurso.lookup("ad-placements").catch(() => [])]);
  return (
    <>
      <PageHeader titulo="Novo anúncio" crumbs={[{ label: "Anúncios", href: "/anuncios" }, { label: "Novo" }]} />
      <AnuncioForm anuncio={null} portais={portais} espacos={espacos} />
    </>
  );
}
