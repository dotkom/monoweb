import type { FC } from "react"
import { useEditArticleMutation } from "../../../../modules/article/mutations/use-edit-article-mutation"
import { useArticleWriteForm } from "../write-form"
import { useArticleDetailsContext } from "./provider"

export const ArticleEditCard: FC = () => {
  const { article } = useArticleDetailsContext()
  const edit = useEditArticleMutation()

  const FormComponent = useArticleWriteForm({
    label: "Oppdater artikkel",
    onSubmit: (data) => {
      const { tags, ...articleData } = data
      edit.mutate({ id: article.id, article: articleData, tags })
    },
    defaultValues: { ...article },
  })
  return <FormComponent />
}
