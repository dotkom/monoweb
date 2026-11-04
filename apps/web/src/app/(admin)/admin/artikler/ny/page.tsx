"use client"

import { ArticleWriteForm } from "../ArticleWriteForm"
import { useCreateArticleMutation } from "../mutations"

export default function Page() {
  const create = useCreateArticleMutation()

  return (
    <ArticleWriteForm
      onSubmit={(data) => {
        const { tags, ...article } = data
        create.mutate({
          article,
          tags,
        })
      }}
      submitLabel="Registrer ny artikkel"
    />
  )
}
