"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudDownload, FlaskConical, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Campo } from "@/components/form/campo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { iniciarImportacao, lerSimulacao } from "./actions";
import { CAMPOS_IMOVEL, type AnuncianteXml, type Simulacao } from "./types";

const INTERVALO_MS = 3000;

/** Botão "Importar agora": escolhe o anunciante, simula (mostra a diferença) ou importa de verdade. */
export function ImportarAgora({
  anunciantes,
}: {
  anunciantes: AnuncianteXml[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [anunciante, setAnunciante] = useState<string>("");
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [pending, start] = useTransition();
  const pedidoEm = useRef<number>(0);
  const escolhido = anunciantes.find((a) => a.id === anunciante);

  useEffect(() => {
    if (!simulando || !anunciante) return;
    const timer = setInterval(async () => {
      const s = await lerSimulacao(anunciante).catch(() => null);
      // Só aceita a simulação gerada depois do clique (a anterior pode ainda estar no disco).
      if (
        s &&
        !s.running &&
        new Date(s.gerado_em).getTime() >= pedidoEm.current
      ) {
        setSimulacao(s);
        setSimulando(false);
      }
    }, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [simulando, anunciante]);

  const disparar = (simular: boolean) =>
    start(async () => {
      pedidoEm.current = Date.now() - 2000;
      const r = await iniciarImportacao(anunciante, simular);
      if (!r.ok) {
        toast.error(r.message ?? "Não foi possível iniciar.");
        return;
      }
      if (simular) {
        setSimulacao(null);
        setSimulando(true);
        toast.info("Simulando: baixando o XML e comparando com o banco…");
      } else {
        toast.success(
          "Importação iniciada. Ela aparece na lista e a página atualiza sozinha.",
        );
        setAberto(false);
        router.refresh();
      }
    });

  const escolher = (id: string) => {
    setAnunciante(id);
    setSimulando(false);
    setSimulacao(null);
    lerSimulacao(id)
      .then((s) => setSimulacao(s && !s.running ? s : null))
      .catch(() => undefined);
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button>
          <CloudDownload data-icon="inline-start" /> Importar agora
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Importar agora</SheetTitle>
          <SheetDescription>
            Baixa o XML do anunciante e compara com os imóveis do portal. A
            simulação mostra o que mudaria sem gravar nada.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-6">
          <Campo id="imp-anunciante" rotulo="Anunciante">
            <Select value={anunciante} onValueChange={escolher}>
              <SelectTrigger id="imp-anunciante" className="w-full">
                <SelectValue placeholder="Escolha o anunciante" />
              </SelectTrigger>
              <SelectContent>
                {anunciantes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                    {a.integrator ? ` · ${a.integrator}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          {escolhido && (
            <dl className="grid gap-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Última importação</dt>
                <dd>
                  {escolhido.last_imported_at
                    ? formatarData(escolhido.last_imported_at, true)
                    : "Nunca"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">XML</dt>
                <dd
                  className="max-w-72 truncate font-mono text-xs"
                  title={escolhido.xml_url}
                >
                  {escolhido.xml_url}
                </dd>
              </div>
            </dl>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!anunciante || pending || simulando}
              onClick={() => disparar(true)}
            >
              {simulando ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <FlaskConical data-icon="inline-start" />
              )}
              {simulando ? "Simulando…" : "Simular"}
            </Button>
            <Button
              disabled={!anunciante || pending || simulando}
              onClick={() => disparar(false)}
            >
              <CloudDownload data-icon="inline-start" /> Importar
            </Button>
          </div>

          {simulacao && <ResultadoSimulacao s={simulacao} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ResultadoSimulacao({ s }: { s: Simulacao }) {
  if (s.erro) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="font-medium text-destructive">A simulação falhou</p>
        <p className="mt-1">{s.erro}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatarData(s.gerado_em, true)}
        </p>
      </div>
    );
  }
  const numeros: Array<[string, number | undefined, string]> = [
    ["No XML", s.total_feed, ""],
    ["Novos", s.novos, "text-success"],
    ["Alterados", s.alterados, "text-warning"],
    ["Iguais", s.iguais, ""],
    ["Excluídos", s.excluidos, "text-destructive"],
    ["Ignorados", s.ignorados, "text-destructive"],
  ];
  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Resultado da simulação"
    >
      <p className="text-xs text-muted-foreground">
        Simulação de {formatarData(s.gerado_em, true)} · formato {s.formato}
      </p>
      <dl className="grid grid-cols-3 gap-2">
        {numeros.map(([rotulo, n, cor]) => (
          <div key={rotulo} className="rounded-lg border p-2 text-center">
            <dt className="text-xs text-muted-foreground">{rotulo}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${cor}`}>
              {formatarNumero(n ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <Lista
        titulo="Alterados"
        itens={s.codigos_alterados?.map((a) => ({
          chave: a.codigo,
          texto: a.campos.map((c) => CAMPOS_IMOVEL[c] ?? c).join(", "),
        }))}
      />
      <Lista
        titulo="Ignorados"
        itens={s.ignorados_lista?.map((i) => ({
          chave: i.codigo || "(sem código)",
          texto: i.motivo,
        }))}
      />
      <Lista
        titulo="Excluídos (saíram do XML)"
        itens={s.codigos_excluidos?.map((c) => ({ chave: c, texto: "" }))}
      />
      <Lista
        titulo="Novos"
        itens={s.codigos_novos?.map((c) => ({ chave: c, texto: "" }))}
      />
    </section>
  );
}

function Lista({
  titulo,
  itens,
}: {
  titulo: string;
  itens?: Array<{ chave: string; texto: string }>;
}) {
  if (!itens?.length) return null;
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
        {titulo} <Badge variant="secondary">{itens.length}</Badge>
      </summary>
      <ul className="max-h-64 divide-y overflow-y-auto border-t text-sm">
        {itens.map((i, idx) => (
          <li key={`${i.chave}-${idx}`} className="flex gap-3 px-3 py-1.5">
            <span className="shrink-0 font-mono text-xs">{i.chave}</span>
            {i.texto && (
              <span className="text-muted-foreground">{i.texto}</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
