import Link from "next/link";
import { notFound } from "next/navigation";
import { Images } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ImovelForm } from "@/features/imoveis/imovel-form";
import type { ImovelDetalhe } from "@/features/imoveis/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar imóvel" };

export default async function EditarImovelPage({ params }: PageProps<"/imoveis/[id]">) {
  await requirePermissao("property", "update");
  const { id } = await params;
  const [imovel, doImovel, doCondominio] = await Promise.all([
    recurso.obter<ImovelDetalhe>("properties", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("features", { scope: "PROPERTY" }).catch(() => [] as LookupOption[]),
    recurso.lookup("features", { scope: "CONDOMINIUM" }).catch(() => [] as LookupOption[]),
  ]);
  if (!imovel) notFound();
  return (
    <>
      <PageHeader
        titulo={imovel.title || imovel.reference_code}
        descricao={`Ref. ${imovel.reference_code} · ${imovel.advertiser_name} · ${imovel.city_name}/${imovel.state_code}`}
        crumbs={[{ label: "Imóveis", href: "/imoveis" }, { label: "Editar" }]}
        acoes={
          <Button asChild variant="outline">
            <Link href={`/imoveis/${imovel.id}/fotos`}><Images data-icon="inline-start" /> Fotos ({imovel.photos.length})</Link>
          </Button>
        }
      />
      <ImovelForm imovel={imovel} caracteristicasImovel={doImovel} caracteristicasCondominio={doCondominio} />
    </>
  );
}
