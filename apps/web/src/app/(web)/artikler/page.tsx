import { cookies } from "next/headers"
import { ArticleListPage } from "./ArticleListPage"
import { ARTICLE_VIEW_COOKIE_NAME, parseArticlesListViewMode } from "./hooks/articleViewCookie"

const ArticlePage = async () => {
  // const tags = await server.article.findTagsOrderedByPopularity.query()
  const cookieStore = await cookies()
  const initialListViewMode = parseArticlesListViewMode(cookieStore.get(ARTICLE_VIEW_COOKIE_NAME)?.value)

  // return (
  //   <div>
  //     <div className="border-gray-600 border-b">
  //       <div className="flex flex-col pb-5">
  //         <Title element="h1" className="text-3xl">
  //           Artikler
  //         </Title>
  //         <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>
  //       </div>
  //     </div>

  //     <div className="mt-8">
  //       <ArticleList tags={tags} />
  //     </div>
  //   </div>
  // )

  return <ArticleListPage initialListViewMode={initialListViewMode} />
}

export default ArticlePage
