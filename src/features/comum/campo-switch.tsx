"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Campo } from "@/components/form/campo";
import { Switch } from "@/components/ui/switch";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rotulo: string;
  /** Texto exibido para [ligado, desligado]. */
  textos?: [string, string];
  ajuda?: string;
  className?: string;
}

/** Campo booleano (Switch) ligado ao react-hook-form. */
export function CampoSwitch<T extends FieldValues>({ control, name, rotulo, textos = ["Sim", "Não"], ajuda, className }: Props<T>) {
  return (
    <Campo id={name} rotulo={rotulo} ajuda={ajuda} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <label className="flex h-9 items-center gap-3 text-sm">
            <Switch id={name} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
            {field.value ? textos[0] : textos[1]}
          </label>
        )}
      />
    </Campo>
  );
}
