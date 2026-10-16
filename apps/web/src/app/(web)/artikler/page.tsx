import { cookies } from "next/headers"
import { ArticleListPage } from "./ArticleListPage"
import { ARTICLE_VIEW_COOKIE_NAME, parseArticlesListViewMode } from "./hooks/articleViewCookie"
import { server } from "@/utils/trpc/server"

const ArticlePage = async () => {
  const cookieStore = await cookies()
  const initialListViewMode = parseArticlesListViewMode(cookieStore.get(ARTICLE_VIEW_COOKIE_NAME)?.value)
  const allAvailableTags = (await server.article.findTagsOrderedByPopularity.query()).map((tag) => tag.name)

  return <ArticleListPage initialListViewMode={initialListViewMode} availableTags={allAvailableTags} />
}

export default ArticlePage
