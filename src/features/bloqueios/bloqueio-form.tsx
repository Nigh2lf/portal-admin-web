"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { salvarRecurso } from "@/lib/actions/crud";
import type { BloqueioDetalhe } from "./types";

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("E-mail inválido.").or(z.literal("")),
    ip_address: z.string().trim(),
    reason: z.string().trim().max(200, "Máximo de 200 caracteres."),
    is_active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.ip_address) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Informe ao menos o e-mail ou o IP a bloquear." });
    }
  });
type Valores = z.infer<typeof schema>;

export function BloqueioForm({ bloqueio }: { bloqueio: BloqueioDetalhe | null }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: bloqueio?.email ?? "",
      ip_address: bloqueio?.ip_address ?? "",
      reason: bloqueio?.reason ?? "",
      is_active: bloqueio?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    // A API aceita `email` vazio (string) mas o IP precisa ir como `null` quando não informado.
    const body = { ...v, ip_address: v.ip_address || null };
    const r = await salvarRecurso<BloqueioDetalhe>("blocked-senders", bloqueio?.id ?? null, body, ["/bloqueios"]);
    if (r.ok) {
      toast.success(r.message);
      router.push("/bloqueios");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Remetente bloqueado" descricao="Informe o e-mail, o IP ou ambos. Formulários públicos vindos deste remetente são recusados.">
        <Campo id="email" rotulo="E-mail" erro={errors.email?.message} ajuda="Opcional se o IP for informado.">
          <Input id="email" type="email" placeholder="spam@exemplo.com" {...register("email")} aria-invalid={!!errors.email} />
        </Campo>
        <Campo id="ip_address" rotulo="Endereço IP" erro={errors.ip_address?.message} ajuda="IPv4 ou IPv6. Opcional se o e-mail for informado.">
          <Input id="ip_address" placeholder="203.0.113.10" {...register("ip_address")} aria-invalid={!!errors.ip_address} />
        </Campo>
        <Campo id="reason" rotulo="Motivo" erro={errors.reason?.message} className="sm:col-span-2">
          <Input id="reason" placeholder="Ex.: envio repetido de spam" {...register("reason")} aria-invalid={!!errors.reason} />
        </Campo>
        <Campo id="is_active" rotulo="Status" className="sm:col-span-2">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center gap-3 text-sm">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Ativo: o bloqueio está em vigor" : "Inativo: o remetente volta a ser aceito"}
              </label>
            )}
          />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/bloqueios" salvando={isSubmitting} />
    </form>
  );
}
