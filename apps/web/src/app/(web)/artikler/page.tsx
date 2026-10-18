import { ArticleListPage } from "./ArticleListPage"
import { server } from "@/utils/trpc/server"

const ArticlePage = async () => {
  const tagsQuery = await server.article.findTagsOrderedByPopularity.query()
  const availableTags = tagsQuery.map((tag) => tag.name)

  return <ArticleListPage availableTags={availableTags} />
}

export default ArticlePage
