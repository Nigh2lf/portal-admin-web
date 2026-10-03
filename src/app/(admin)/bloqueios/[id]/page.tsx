import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BloqueioForm } from "@/features/bloqueios/bloqueio-form";
import type { BloqueioDetalhe } from "@/features/bloqueios/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar bloqueio" };

export default async function EditarBloqueioPage({ params }: PageProps<"/bloqueios/[id]">) {
  await requirePermissao("blocked_sender", "update");
  const { id } = await params;
  const bloqueio = await recurso.obter<BloqueioDetalhe>("blocked-senders", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!bloqueio) notFound();
  return (
    <>
      <PageHeader
        titulo={bloqueio.email || bloqueio.ip_address || "Bloqueio"}
        descricao={bloqueio.reason || undefined}
        crumbs={[{ label: "Remetentes bloqueados", href: "/bloqueios" }, { label: "Editar" }]}
      />
      <BloqueioForm bloqueio={bloqueio} />
    </>
  );
}
