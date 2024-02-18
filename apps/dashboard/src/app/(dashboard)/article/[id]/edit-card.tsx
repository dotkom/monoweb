import { type FC } from "react"
import { useArticleDetailsContext } from "./provider"
import { useArticleWriteForm } from "../write-form"
import { useEditArticleMutation } from "../../../../modules/article/mutations/use-edit-article-mutation"

export const ArticleEditCard: FC = () => {
  const { article } = useArticleDetailsContext()
  const edit = useEditArticleMutation()

  const FormComponent = useArticleWriteForm({
    label: "Oppdater artikkel",
    onSubmit: (data) => {
      edit.mutate({ id: article.id, input: data })
    },
    defaultValues: { ...article },
  })
  return <FormComponent />
}
