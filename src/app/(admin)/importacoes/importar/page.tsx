import { PageHeader } from "@/components/layout/page-header";
import { BatchProgress } from "@/features/importacoes/batch-progress";
import { ImportForm } from "@/features/importacoes/import-form";
import type {
  AnuncianteXml,
  ImportBatchDetail,
} from "@/features/importacoes/types";
import { apiFetch } from "@/lib/api/client";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Importar agora" };

export default async function ImportarAgoraPage() {
  await requirePermissao("xml_import_run", "create");
  const [advertisers, activeBatch] = await Promise.all([
    apiFetch<AnuncianteXml[]>("/xml-import-runs/advertisers/"),
    apiFetch<ImportBatchDetail | null>(
      "/xml-import-runs/batches/active/",
    ).catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        titulo="Importar agora"
        descricao="Escolha todos os anunciantes ou alguns deles. O progresso aparece aqui e na lista de importações."
        crumbs={[
          { label: "Importações XML", href: "/importacoes" },
          { label: "Importar agora" },
        ]}
      />
      <div className="mb-6">
        <BatchProgress initial={activeBatch} canCancel />
      </div>
      <ImportForm advertisers={advertisers} disabled={!!activeBatch} />
    </>
  );
}
