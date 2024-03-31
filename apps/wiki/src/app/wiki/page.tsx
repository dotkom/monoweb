import { Session } from "inspector"
import { getServerSession } from "next-auth"
import { Tiptap } from "src/components/tiptap"
import { existsById } from "src/hooks/exists-by-id"
import { getArticle } from "src/hooks/get-article"
import { getArticleContent } from "src/hooks/get-article-content"
import { updateArticleContent } from "src/hooks/update-article-content"

export default async function WikiPage() {
  const article = await getArticle("/wiki")
  const auth = await getServerSession()

  if (!article) {
    return (
      <div className="flex justify-center w-full py-32">
        <h2>Something went wrong! Quick! Do a summoning ritual!</h2>
      </div>
    )
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
          access={auth ? true : false}
          json={content ? JSON.parse(content) : null}
          updateContent={{ func: updateArticleContent, id: article.Id }}
        />
      </div>
    </>
  )
}
