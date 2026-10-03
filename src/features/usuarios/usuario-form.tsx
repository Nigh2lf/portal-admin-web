"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import type { LookupOption } from "@/lib/api/types";
import { salvarUsuario } from "./actions";
import { usuarioSchema, type UsuarioForm as Valores } from "./schemas";
import { PAPEIS, type UsuarioDetalhe } from "./types";

export function UsuarioForm({ usuario, perfis }: { usuario: UsuarioDetalhe | null; perfis: LookupOption[] }) {
  const router = useRouter();
  const form = useForm<Valores>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      name: usuario?.name ?? "",
      email: usuario?.email ?? "",
      role: usuario?.role ?? "USER",
      is_active: usuario?.is_active ?? true,
      profiles: usuario?.profiles ?? [],
      password: "",
      password_confirm: "",
    },
  });
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = form;

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarUsuario(usuario?.id ?? null, v);
    if (r.ok) {
      toast.success(r.message);
      router.push("/usuarios");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Dados do usuário">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="email" rotulo="E-mail" erro={errors.email?.message} obrigatorio>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        </Campo>
        <Campo id="is_active" rotulo="Status" className="sm:col-span-2">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center gap-3 text-sm">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Ativo: pode entrar no sistema" : "Inativo: login bloqueado"}
              </label>
            )}
          />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Papel" descricao="Define o nível de acesso ao painel.">
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              {PAPEIS.map((p) => (
                <label key={p.value} htmlFor={`role-${p.value}`} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                  <RadioGroupItem id={`role-${p.value}`} value={p.value} className="mt-0.5" />
                  <span>
                    <span className="block font-medium">{p.label}</span>
                    <span className="block text-sm text-muted-foreground">{p.descricao}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </FormSecao>

      <FormSecao titulo="Perfis de acesso" descricao="Os perfis definem quais telas e operações o usuário enxerga.">
        <Controller
          control={control}
          name="profiles"
          render={({ field }) => (
            <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
              {perfis.length === 0 && <p className="text-sm text-muted-foreground">Nenhum perfil cadastrado.</p>}
              {perfis.map((p) => {
                const marcado = field.value.includes(p.key);
                return (
                  <label key={p.key} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary">
                    <Checkbox checked={marcado} onCheckedChange={(c) => field.onChange(c ? [...field.value, p.key] : field.value.filter((x) => x !== p.key))} />
                    {p.value}
                  </label>
                );
              })}
            </div>
          )}
        />
      </FormSecao>

      <FormSecao titulo={usuario ? "Redefinir senha" : "Senha"} descricao={usuario ? "Deixe em branco para manter a senha atual." : "Mínimo de 8 caracteres."}>
        <Campo id="password" rotulo="Senha" erro={errors.password?.message} obrigatorio={!usuario}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} aria-invalid={!!errors.password} />
        </Campo>
        <Campo id="password_confirm" rotulo="Confirmar senha" erro={errors.password_confirm?.message} obrigatorio={!usuario}>
          <Input id="password_confirm" type="password" autoComplete="new-password" {...register("password_confirm")} aria-invalid={!!errors.password_confirm} />
        </Campo>
      </FormSecao>

      <FormFooter voltarHref="/usuarios" salvando={isSubmitting} />
    </form>
  );
}
