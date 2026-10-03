import Link from "next/link";
import { notFound } from "next/navigation";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AnuncianteForm } from "@/features/anunciantes/anunciante-form";
import { ROTULO_TIPO, type AnuncianteDetalhe } from "@/features/anunciantes/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar anunciante" };

export default async function EditarAnunciantePage({ params }: PageProps<"/anunciantes/[id]">) {
  const sessao = await requirePermissao("advertiser", "update");
  const { id } = await params;
  const [anunciante, cidades] = await Promise.all([
    recurso.obter<AnuncianteDetalhe>("advertisers", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("cities").catch(() => [] as LookupOption[]),
  ]);
  if (!anunciante) notFound();
  return (
    <>
      <PageHeader
        titulo={anunciante.name}
        descricao={`${ROTULO_TIPO[anunciante.type]} · ${anunciante.portal_name} · ${anunciante.plan_name} · ${anunciante.properties_count} imóvel(is)`}
        crumbs={[{ label: "Anunciantes", href: "/anunciantes" }, { label: "Editar" }]}
        acoes={
          pode(sessao, "property") && (
            <Button asChild variant="outline">
              <Link href={`/imoveis?advertiser=${anunciante.id}`}><Home data-icon="inline-start" /> Ver imóveis</Link>
            </Button>
          )
        }
      />
      <AnuncianteForm anunciante={anunciante} cidades={cidades} />
    </>
  );
}
