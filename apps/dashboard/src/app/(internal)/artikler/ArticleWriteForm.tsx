import { CheckboxField } from "@/components/forms/CheckboxField"
import { Form } from "@/components/forms/Form"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { RichTextField } from "@/components/forms/RichTextField"
import { TagField } from "@/components/forms/TagField"
import { TextField } from "@/components/forms/TextField"
import { ARTICLE_IMAGE_MAX_SIZE_KIB, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/rpc/article"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { useArticleFileUploadMutation } from "./mutations"
import { useTagsAllQuery } from "./queries"

const ARTICLE_FORM_DEFAULT_VALUES: Partial<ArticleWriteFormSchema> = {
  tags: [],
  isFeatured: false,
  imageUrl: "",
  vimeoId: null,
}

export const ArticleWriteFormSchema = ArticleWriteSchema.extend({
  tags: ArticleTagSchema.shape.name.array(),
})
type ArticleWriteFormSchema = z.infer<typeof ArticleWriteFormSchema>

interface UseArticleWriteFormProps {
  onSubmit(data: z.infer<typeof ArticleWriteFormSchema>): void
  defaultValues?: Partial<ArticleWriteFormSchema>
  submitLabel?: string
  disabled?: boolean
}

export const ArticleWriteForm = ({
  onSubmit,
  defaultValues = ARTICLE_FORM_DEFAULT_VALUES,
  submitLabel = "Lagre",
  disabled,
}: UseArticleWriteFormProps) => {
  const { tags } = useTagsAllQuery()
  const fileUpload = useArticleFileUploadMutation()

  const form = useForm<ArticleWriteFormSchema>({
    resolver: zodResolver(ArticleWriteFormSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="title" label="Tittel" placeholder="Fadderuka 2023" required />
      <TextField control={form.control} name="slug" label="Slug" placeholder="fadderuka-2023" required />
      <TextField
        control={form.control}
        name="author"
        label="Forfattere"
        placeholder="Ola Nordmann, Trond-Viggo Torgersen"
        required
      />
      <TextField control={form.control} name="photographer" label="Fotograf" placeholder="Jahn Teigen" required />
      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Cover bilde"
        maxSizeKiB={ARTICLE_IMAGE_MAX_SIZE_KIB}
        required
        onFileUpload={fileUpload}
      />
      <TextField
        control={form.control}
        name="vimeoId"
        label="Vimeo id"
        description="Vil bli vist istedenfor bilde"
        placeholder="84024464"
      />
      <TagField
        control={form.control}
        data={tags.map((tag) => tag.name)}
        name="tags"
        label="Tags"
        placeholder="Velg eller skriv inn en tag"
      />
      <CheckboxField control={form.control} name="isFeatured" label="Fremhevet" />
      <RichTextField control={form.control} name="excerpt" label="Ingress" required onFileUpload={fileUpload} />
      <RichTextField control={form.control} name="content" label="Innhold" required onFileUpload={fileUpload} />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
