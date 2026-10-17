import { ArticleListPage } from "./ArticleListPage"
import { server } from "@/utils/trpc/server"

const ArticlePage = async () => {
  const allAvailableTags = (await server.article.findTagsOrderedByPopularity.query()).map((tag) => tag.name)

  return <ArticleListPage availableTags={allAvailableTags} />
}

export default ArticlePage
