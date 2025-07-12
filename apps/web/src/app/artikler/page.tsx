import { ArticleList } from "@/components/organisms/ArticleList"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"

const ArticlePage = async () => {
  const articles = await server.article.all.query()
  const tags = await server.article.getTags.query()

  return (
    <div>
      <div className="border-slate-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Artikler
          </Title>
          <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>
        </div>
      </div>

      <div className="mt-8">
        <ArticleList articles={articles} tags={tags} />
      </div>
    </div>
  )
}

export default ArticlePage
