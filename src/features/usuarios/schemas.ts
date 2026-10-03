import { z } from "zod";

export const usuarioSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome."),
    email: z.string().trim().email("E-mail inválido."),
    role: z.enum(["ADMIN", "USER"]),
    is_active: z.boolean(),
    profiles: z.array(z.string()),
    password: z.string().optional(),
    password_confirm: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.password && v.password.length < 8) ctx.addIssue({ code: "custom", path: ["password"], message: "Mínimo de 8 caracteres." });
    if (v.password && v.password !== v.password_confirm) ctx.addIssue({ code: "custom", path: ["password_confirm"], message: "As senhas não conferem." });
  });

export type UsuarioForm = z.infer<typeof usuarioSchema>;

export const senhaSchema = z
  .object({
    old_password: z.string().min(1, "Informe a senha atual."),
    password: z.string().min(8, "Mínimo de 8 caracteres."),
    password_confirm: z.string(),
  })
  .refine((v) => v.password === v.password_confirm, { path: ["password_confirm"], message: "As senhas não conferem." });

export type SenhaForm = z.infer<typeof senhaSchema>;
