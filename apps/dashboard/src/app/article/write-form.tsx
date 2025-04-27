import { createCheckboxInput, createFileInput, createRichTextInput, createTagInput } from "@/app/form"
import { useFormBuilder } from "@/components/forms/Form"
import { createTextInput } from "@/components/forms/TextInput"
import { ArticleSchema, type ArticleWrite, ArticleWriteSchema } from "@dotkomonline/types"
import { useTagsAllQuery } from "src/modules/article/queries/use-tags-all-query"
import type { z } from "zod"

const ARTICLE_FORM_DEFAULT_VALUES: Partial<ArticleWrite> = {}

export const ArticleWriteFormSchema = ArticleWriteSchema.extend({
  tags: ArticleSchema.shape.tags,
})

interface UseArticleWriteFormProps {
  onSubmit(data: z.infer<typeof ArticleWriteFormSchema>): void
  defaultValues?: Partial<ArticleWrite>
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
        data: tags.map((tag) => tag.name),
        required: true,
      }),
      isFeatured: createCheckboxInput({
        label: "Fremhevet",
      }),
      excerpt: createRichTextInput({
        label: "Ingress",
        markdown: "",
        required: true,
      }),
      content: createRichTextInput({
        label: "Innhold",
        markdown: "",
        required: true,
      }),
    },
  })
}
