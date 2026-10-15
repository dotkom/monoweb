import { cookies } from "next/headers"
import { ArticleListPage } from "./ArticleListPage"
import { ARTICLE_VIEW_COOKIE_NAME, parseArticlesListViewMode } from "./hooks/articleViewCookie"

const ArticlePage = async () => {
  const cookieStore = await cookies()
  const initialListViewMode = parseArticlesListViewMode(cookieStore.get(ARTICLE_VIEW_COOKIE_NAME)?.value)

  return <ArticleListPage initialListViewMode={initialListViewMode} />
}

export default ArticlePage
