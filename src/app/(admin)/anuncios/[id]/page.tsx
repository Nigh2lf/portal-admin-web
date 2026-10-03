import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AnuncioForm } from "@/features/anuncios/anuncio-form";
import type { AnuncioDetalhe } from "@/features/anuncios/types";
import { urlMidia } from "@/features/comum/midia";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar anúncio" };

export default async function EditarAnuncioPage({ params }: PageProps<"/anuncios/[id]">) {
  await requirePermissao("ad", "update");
  const { id } = await params;
  const [anuncio, portais, espacos] = await Promise.all([
    recurso.obter<AnuncioDetalhe>("ads", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("portals").catch(() => []),
    recurso.lookup("ad-placements").catch(() => []),
  ]);
  if (!anuncio) notFound();
  return (
    <>
      <PageHeader titulo={anuncio.name} descricao={`${anuncio.portal_name} · ${anuncio.placement_code} – ${anuncio.placement_name}`} crumbs={[{ label: "Anúncios", href: "/anuncios" }, { label: "Editar" }]} />
      <AnuncioForm anuncio={{ ...anuncio, image_url: urlMidia(anuncio.image_url) }} portais={portais} espacos={espacos} />
    </>
  );
}
