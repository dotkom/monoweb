"use client"

import { ArticleWriteForm } from "../ArticleWriteForm"
import { useEditArticleMutation } from "../mutations"
import { useArticleDetailsContext } from "./provider"

export default function ArticleDetailsPage() {
  const { article } = useArticleDetailsContext()
  const edit = useEditArticleMutation()

  return (
    <ArticleWriteForm
      submitLabel="Oppdater artikkel"
      onSubmit={(data) => {
        const { tags, ...newArticle } = data
        edit.mutate({ id: article.id, input: newArticle, tags })
      }}
      defaultValues={{ ...article, tags: article.tags.map((tag) => tag.name) }}
    />
  )
}
