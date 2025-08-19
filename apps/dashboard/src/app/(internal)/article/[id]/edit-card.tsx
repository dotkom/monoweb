import type { FC } from "react"
import { useEditArticleMutation } from "../mutations"
import { useArticleWriteForm } from "../write-form"
import { useArticleDetailsContext } from "./provider"

export const ArticleEditCard: FC = () => {
  const { article } = useArticleDetailsContext()
  const edit = useEditArticleMutation()

  const FormComponent = useArticleWriteForm({
    label: "Oppdater artikkel",
    onSubmit: (data) => {
      const { tags, ...articleData } = data
      edit.mutate({ id: article.id, input: articleData, tags: tags })
    },
    defaultValues: { ...article, tags: article.tags.map((tag) => tag.name) },
  })
  return <FormComponent />
}
