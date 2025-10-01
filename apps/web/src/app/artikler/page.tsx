import { ArticlePageContent } from "@/app/artikler/ArticlePageContent"
import { server } from "@/utils/trpc/server"

const ArticlePage = async () => {
  const tags = await server.article.findTagsOrderedByPopularity.query();
  console.log(tags);
  return <ArticlePageContent tags={tags} />
}

export default ArticlePage
