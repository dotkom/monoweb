import { Text, Title } from "@dotkomonline/ui"
import { ArticleList } from "@/app/artikler/ArticleList"
import { server } from "@/utils/trpc/server"

const ArticlePage = async () => {
  const tags = await server.article.findTagsOrderedByPopularity.query()

  return (
    <div>
      <div className="border-gray-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Artikler
          </Title>
          <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>
        </div>
      </div>

      <div className="mt-8">
        <ArticleList tags={tags} />
      </div>
    </div>
  )
}

export default ArticlePage
