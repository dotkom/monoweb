import { useTagsAllQuery } from "@/app/(internal)/article/queries"
import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createTagInput } from "@/components/forms/TagInput"
import { createTextInput } from "@/components/forms/TextInput"
import { ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"

const ARTICLE_FORM_DEFAULT_VALUES: Partial<ArticleWriteFormSchema> = {}

export const ArticleWriteFormSchema = ArticleWriteSchema.extend({
  tags: ArticleTagSchema.shape.name.array(),
})
type ArticleWriteFormSchema = z.infer<typeof ArticleWriteFormSchema>

interface UseArticleWriteFormProps {
  onSubmit(data: z.infer<typeof ArticleWriteFormSchema>): void
  defaultValues?: Partial<ArticleWriteFormSchema>
  label?: string
}

export const useArticleWriteForm = ({
  onSubmit,
  label = "Legg inn ny artikkel",
  defaultValues = ARTICLE_FORM_DEFAULT_VALUES,
}: UseArticleWriteFormProps) => {
  const { tags } = useTagsAllQuery()
  return useFormBuilder({
    schema: ArticleWriteFormSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Fadderuka 2023",
        required: true,
      }),
      author: createTextInput({
        label: "Forfattere",
        placeholder: "Ola Nordmann, Trond-Viggo Torgersen",
        required: true,
      }),
      photographer: createTextInput({
        label: "Fotograf",
        placeholder: "Jahn Teigen",
        required: true,
      }),
      imageUrl: createFileInput({
        label: "Cover bilde",
        placeholder: "Last opp",
        required: true,
      }),
      vimeoId: createTextInput({
        label: "Vimeo id",
        placeholder: "84024464",
      }),
      slug: createTextInput({
        label: "Slug",
        placeholder: "fadderuka-2023",
        required: true,
      }),
      tags: createTagInput({
        label: "Tags",
        placeholder: "Velg eller skriv inn en tag",
        data: tags.map((tag) => tag.name),
        required: true,
      }),
      isFeatured: createCheckboxInput({
        label: "Fremhevet",
      }),
      excerpt: createRichTextInput({
        label: "Ingress",
        required: true,
      }),
      content: createRichTextInput({
        label: "Innhold",
        required: true,
      }),
    },
  })
}
