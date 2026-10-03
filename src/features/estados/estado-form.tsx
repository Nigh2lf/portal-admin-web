"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { estadoSchema, type EstadoForm as Valores } from "./schemas";
import type { EstadoDetalhe } from "./types";

export function EstadoForm({ estado }: { estado: EstadoDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(estadoSchema),
    defaultValues: { code: estado?.code ?? "", name: estado?.name ?? "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<EstadoDetalhe>("states", estado?.id ?? null, v, ["/estados"]);
    tratarResultado(r, setError, () => {
      router.push("/estados");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Dados do estado">
        <Campo id="code" rotulo="Sigla (UF)" erro={errors.code?.message} ajuda="Duas letras, ex.: RJ." obrigatorio>
          <Input id="code" maxLength={2} className="uppercase" {...register("code")} aria-invalid={!!errors.code} />
        </Campo>
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/estados" salvando={isSubmitting} />
    </form>
  );
}
