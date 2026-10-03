"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImageIcon, Trash2, Undo2, X } from "lucide-react";
import { Campo } from "@/components/form/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  id: string;
  rotulo: string;
  /** URL da imagem já salva (absoluta). */
  urlAtual?: string | null;
  arquivo: File | null | undefined;
  onArquivo: (f: File | null) => void;
  /** Quando informado, permite marcar a imagem atual para remoção. */
  removido?: boolean;
  onRemover?: (remover: boolean) => void;
  erro?: string;
  ajuda?: string;
  obrigatorio?: boolean;
  className?: string;
}

/** Input de arquivo com pré-visualização da imagem atual ou da recém-selecionada. */
export function CampoImagem({ id, rotulo, urlAtual, arquivo, onArquivo, removido, onRemover, erro, ajuda, obrigatorio, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewNovo = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(
    () => () => {
      if (previewNovo) URL.revokeObjectURL(previewNovo);
    },
    [previewNovo],
  );

  const src = previewNovo ?? (removido ? null : (urlAtual ?? null));

  const limparSelecao = () => {
    onArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Campo id={id} rotulo={rotulo} erro={erro} ajuda={ajuda} obrigatorio={obrigatorio} className={className}>
      <div className="flex items-start gap-3">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            aria-invalid={!!erro}
            onChange={(e) => {
              onArquivo(e.target.files?.[0] ?? null);
              onRemover?.(false);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {arquivo && (
              <Button type="button" variant="ghost" size="sm" onClick={limparSelecao}>
                <X data-icon="inline-start" /> Descartar seleção
              </Button>
            )}
            {onRemover && urlAtual && !arquivo && (
              removido ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => onRemover(false)}>
                  <Undo2 data-icon="inline-start" /> Desfazer remoção
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={() => onRemover(true)}>
                  <Trash2 data-icon="inline-start" /> Remover imagem
                </Button>
              )
            )}
            {removido && !arquivo && <span className="text-xs text-muted-foreground">A imagem será removida ao salvar.</span>}
          </div>
        </div>
      </div>
    </Campo>
  );
}
