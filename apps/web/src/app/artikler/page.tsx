import { ArticleList } from "@/app/artikler/ArticleList"
import { ArticleSearchSection } from "@/app/artikler/ArticleSearchSection"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"

const ArticlePage = async () => {
  const tags = await server.article.findTagsOrderedByPopularity.query();

  // Fallback data for development if server call fails
  const fallbackTags = [
    { name: "test" },
    { name: "test2" },
    { name: "javascript" },
    { name: "react" }
  ];

  const tagsToUse = tags.length > 0 ? tags : fallbackTags;

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

      <div className="mt-8 flex gap-8">
        <div className="flex-shrink-0">
          <ArticleSearchSection tags={tagsToUse} />
        </div>
        <div className="flex-1">
          <ArticleList tags={tagsToUse} />
        </div>
      </div>
    </div>
  )
}

export default ArticlePage
