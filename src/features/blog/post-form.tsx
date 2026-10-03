"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Wand2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { datetimeLocalParaIso, isoParaDatetimeLocal } from "@/features/compartilhado/datas";
import { salvarRecurso, salvarRecursoMultipart } from "@/lib/actions/crud";
import { slugify } from "@/lib/utils/format";
import type { PostDetalhe } from "./types";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

const schema = z.object({
  portal: z.string().nullable(),
  title: z.string().trim().min(2, "Informe o título.").max(200, "Máximo de 200 caracteres."),
  slug: z
    .string()
    .trim()
    .max(220, "Máximo de 220 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hifens.")
    .or(z.literal("")),
  excerpt: z.string().trim().max(400, "Máximo de 400 caracteres."),
  body: z.string().trim().min(1, "Informe o conteúdo."),
  author_name: z.string().trim().max(100, "Máximo de 100 caracteres."),
  is_published: z.boolean(),
  published_at: z.string(),
});
type Valores = z.infer<typeof schema>;

export function PostForm({ post }: { post: PostDetalhe | null }) {
  const router = useRouter();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [removerCapa, setRemoverCapa] = useState(false);
  const [erroCapa, setErroCapa] = useState<string | null>(null);

  const { register, control, handleSubmit, setError, setValue, getValues, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: {
      portal: post?.portal ?? null,
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      body: post?.body ?? "",
      author_name: post?.author_name ?? "",
      is_published: post?.is_published ?? false,
      published_at: isoParaDatetimeLocal(post?.published_at),
    },
  });
  const titulo = useWatch({ control, name: "title" });

  const previa = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  const capaAtual = !removerCapa && !arquivo ? post?.cover_image_url ?? null : null;
  const imagemExibida = previa ?? capaAtual;

  const escolherArquivo = (f: File | null) => {
    setErroCapa(null);
    if (!f) return setArquivo(null);
    if (!f.type.startsWith("image/")) return setErroCapa("Selecione um arquivo de imagem.");
    if (f.size > TAMANHO_MAXIMO) return setErroCapa("A imagem deve ter até 5 MB.");
    setRemoverCapa(false);
    setArquivo(f);
  };

  const onSubmit = handleSubmit(async (v) => {
    const body: Record<string, unknown> = { ...v, published_at: datetimeLocalParaIso(v.published_at) };
    if (removerCapa && !arquivo && post?.cover_image_url) body.cover_image = null;

    const r = await salvarRecurso<PostDetalhe>("blog-posts", post?.id ?? null, body, ["/blog"]);
    if (!r.ok) {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
      return;
    }

    const id = r.data?.id ?? post?.id;
    if (arquivo && id) {
      const fd = new FormData();
      fd.append("cover_image", arquivo);
      const rc = await salvarRecursoMultipart<PostDetalhe>("blog-posts", id, fd, ["/blog"]);
      if (!rc.ok) {
        setErroCapa(rc.errors?.cover_image?.join(" ") ?? rc.message ?? "Não foi possível enviar a capa.");
        toast.error("Post salvo, mas a capa não foi enviada.");
        router.replace(`/blog/${id}`);
        router.refresh();
        return;
      }
    }

    toast.success(r.message);
    router.push("/blog");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-4xl flex-col gap-6">
      <FormSecao titulo="Post">
        <Campo id="title" rotulo="Título" erro={errors.title?.message} obrigatorio className="sm:col-span-2">
          <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Opcional: gerado a partir do título quando vazio. Precisa ser único.">
          <div className="flex gap-2">
            <Input id="slug" placeholder="meu-post" {...register("slug")} aria-invalid={!!errors.slug} />
            <Button type="button" variant="outline" size="icon-lg" aria-label="Gerar slug a partir do título" title="Gerar a partir do título" disabled={!titulo} onClick={() => setValue("slug", slugify(getValues("title")), { shouldDirty: true, shouldValidate: true })}>
              <Wand2 />
            </Button>
          </div>
        </Campo>
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} ajuda="Deixe em branco para publicar em todos os portais.">
          <Controller
            control={control}
            name="portal"
            render={({ field }) => <SelectLookup id="portal" recurso="portals" value={field.value} onChange={field.onChange} placeholder="Todos os portais" />}
          />
        </Campo>
        <Campo id="author_name" rotulo="Autor" erro={errors.author_name?.message}>
          <Input id="author_name" {...register("author_name")} aria-invalid={!!errors.author_name} />
        </Campo>
        <Campo id="excerpt" rotulo="Resumo" erro={errors.excerpt?.message} ajuda="Até 400 caracteres; aparece na listagem do blog." className="sm:col-span-2">
          <Textarea id="excerpt" rows={3} {...register("excerpt")} aria-invalid={!!errors.excerpt} />
        </Campo>
        <Campo id="body" rotulo="Conteúdo" erro={errors.body?.message} obrigatorio ajuda="Aceita HTML (títulos, parágrafos, listas, imagens, links)." className="sm:col-span-2">
          <Textarea id="body" rows={16} className="min-h-72 font-mono text-sm" {...register("body")} aria-invalid={!!errors.body} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Imagem de capa" descricao="JPG, PNG ou WebP de até 5 MB. A capa é enviada após salvar o post.">
        <Campo id="cover_image" rotulo="Arquivo" erro={erroCapa ?? undefined}>
          <Input id="cover_image" type="file" accept="image/*" onChange={(e) => escolherArquivo(e.target.files?.[0] ?? null)} aria-invalid={!!erroCapa} />
        </Campo>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Pré-visualização</span>
          {imagemExibida ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemExibida} alt="Capa do post" className="aspect-video w-full max-w-sm rounded-lg border object-cover" />
          ) : (
            <div className="flex aspect-video w-full max-w-sm items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="ml-2 text-sm">{removerCapa ? "A capa será removida ao salvar" : "Sem capa"}</span>
            </div>
          )}
          <div className="flex gap-2">
            {arquivo && (
              <Button type="button" variant="ghost" size="sm" onClick={() => escolherArquivo(null)}>Descartar seleção</Button>
            )}
            {post?.cover_image_url && !arquivo && (
              <Button type="button" variant={removerCapa ? "outline" : "ghost"} size="sm" onClick={() => setRemoverCapa((v) => !v)}>
                {removerCapa ? "Manter capa atual" : "Remover capa"}
              </Button>
            )}
          </div>
        </div>
      </FormSecao>

      <FormSecao titulo="Publicação">
        <Campo id="published_at" rotulo="Publicado em" erro={errors.published_at?.message} ajuda="Opcional. Data e hora de publicação.">
          <Input id="published_at" type="datetime-local" {...register("published_at")} aria-invalid={!!errors.published_at} />
        </Campo>
        <Campo id="is_published" rotulo="Status">
          <Controller
            control={control}
            name="is_published"
            render={({ field }) => (
              <label className="flex h-8 items-center gap-3 text-sm">
                <Switch id="is_published" checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Publicado: visível no blog" : "Rascunho: oculto"}
              </label>
            )}
          />
        </Campo>
      </FormSecao>

      <FormFooter voltarHref="/blog" salvando={isSubmitting} />
    </form>
  );
}
