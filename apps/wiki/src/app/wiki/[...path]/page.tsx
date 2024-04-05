import { Tiptap } from "src/components/tiptap"
import { existsById } from "src/hooks/exists-by-id"
import { getArticle } from "src/hooks/get-article"
import { getArticleContent } from "src/hooks/get-article-content"
import { updateArticleContent } from "src/hooks/update-article-content"

type PathParams = {
  params: {
    path: string[]
  }
}

export default async function WikiPage({ params }: PathParams) {
  const path = params?.path?.join("/")
  const article = await getArticle(`/wiki/${path}`)

  if (!article) {
    return <h1>Article not found {path}</h1>
  }
  const articleExists = await existsById(article.Id)
  if (!articleExists) {
    updateArticleContent(article.Id, "{}")
  }
  const content = await getArticleContent(article.Id)
  return (
    <>
      <div className="px-20 flex flex-col w-full gap-10">
        <h1>{article?.Title}</h1>
        <Tiptap
          access={true}
          json={content ? JSON.parse(content) : null}
          updateContent={{ func: updateArticleContent, id: article.Id }}
        />
      </div>
    </>
  )
}
