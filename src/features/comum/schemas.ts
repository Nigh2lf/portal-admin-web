import { z } from "zod";

export const inteiroNaoNegativo = (msg = "Informe um número inteiro.") =>
  z.number({ error: msg }).int(msg).min(0, "Não pode ser negativo.");

export const inteiroPositivo = (msg = "Informe um número inteiro.") =>
  z.number({ error: msg }).int(msg).min(1, "Deve ser maior que zero.");

/** Decimal opcional (ex.: preço); `null` = não informado. */
export const decimalOpcional = z.number({ error: "Informe um valor válido." }).min(0, "Não pode ser negativo.").nullable();

export const slugOpcional = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]*$/, "Use apenas letras minúsculas, números e hífens.");

export const slugObrigatorio = slugOpcional.pipe(z.string().min(1, "Informe o slug."));

export const urlOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Informe uma URL válida (http/https).");

export const corHexOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v), "Use o formato #RRGGBB.");

/** Arquivo de imagem selecionado no navegador (ou nada). */
export const arquivoOpcional = z
  .custom<File>((v) => typeof File !== "undefined" && v instanceof File, { message: "Selecione uma imagem." })
  .nullable();

/** Para `register(name, { setValueAs: numeroOuNulo })` em inputs numéricos opcionais. */
export const numeroOuNulo = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));
