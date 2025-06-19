import { ArticleView } from "@/components/views/ArticleView"
import { server } from "@/utils/trpc/server"
import { notFound } from "next/navigation"

const ArticlePage = async ({ params }: { params: Promise<{ id: string; slug: string }> }) => {
  const { id } = await params

  const article = await server.article.get.query(id)
  if (!article) {
    return notFound()
  }

  return <ArticleView article={article} />
}

export default ArticlePage
