import { type ArticleWrite, ArticleWriteSchema } from "@dotkomonline/types"
import { createTextInput, createTextareaInput, useFormBuilder } from "../../form"

const ARTICLE_FORM_DEFAULT_VALUES: Partial<ArticleWrite> = {}

interface UseArticleWriteFormProps {
  onSubmit(data: ArticleWrite): void
  defaultValues?: Partial<ArticleWrite>
  label?: string
}

export const useArticleWriteForm = ({
  onSubmit,
  label = "Legg inn ny artikkel",
  defaultValues = ARTICLE_FORM_DEFAULT_VALUES,
}: UseArticleWriteFormProps) =>
  useFormBuilder({
    schema: ArticleWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Fadderuka 2023",
        withAsterisk: true,
      }),
      author: createTextInput({
        label: "Forfattere",
        placeholder: "Ola Nordmann, Trond-Viggo Torgersen",
        withAsterisk: true,
      }),
      photographer: createTextInput({
        label: "Fotograf",
        placeholder: "Jahn Teigen",
        withAsterisk: true,
      }),
      imageUrl: createTextInput({
        type: "url",
        label: "Cover bilde",
        placeholder: "https://s3.amazonaws.com/mitt-bilde.png",
        withAsterisk: true,
      }),
      slug: createTextInput({
        label: "Slug",
        placeholder: "fadderuka-2023",
        withAsterisk: true,
      }),
      excerpt: createTextareaInput({
        label: "Ingress",
        withAsterisk: true,
        rows: 5,
      }),
      content: createTextareaInput({
        label: "Innhold",
        withAsterisk: true,
        rows: 20,
      }),
    },
  })
