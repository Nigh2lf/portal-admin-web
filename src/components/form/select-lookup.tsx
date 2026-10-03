"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buscarLookup } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";

interface Props {
  id: string;
  /** Caminho do recurso com `/lookup/` (ex.: `cities`). */
  recurso: string;
  params?: Record<string, string | undefined>;
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  placeholder?: string;
  opcoesIniciais?: LookupOption[];
  permitirVazio?: boolean;
  disabled?: boolean;
}

/** Select alimentado por `GET /<recurso>/lookup/`; recarrega quando `params` muda. */
export function SelectLookup({ id, recurso, params, value, onChange, placeholder = "Selecione…", opcoesIniciais, permitirVazio = true, disabled }: Props) {
  const [opcoes, setOpcoes] = useState<LookupOption[]>(opcoesIniciais ?? []);
  const [carregando, setCarregando] = useState(!opcoesIniciais);
  const chave = JSON.stringify(params ?? {});

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      const o = await buscarLookup(recurso, JSON.parse(chave)).catch(() => [] as LookupOption[]);
      if (!ativo) return;
      setOpcoes(o);
      setCarregando(false);
    };
    void carregar();
    return () => {
      ativo = false;
    };
  }, [recurso, chave]);

  return (
    <Select value={value ?? "__vazio"} onValueChange={(v) => onChange(v === "__vazio" ? null : v)} disabled={disabled || carregando}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={carregando ? "Carregando…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {permitirVazio && <SelectItem value="__vazio">—</SelectItem>}
        {opcoes.map((o) => (
          <SelectItem key={o.key} value={o.key}>{o.value}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
