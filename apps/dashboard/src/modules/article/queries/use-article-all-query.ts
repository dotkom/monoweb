import { trpc } from "../../../trpc"

export const useArticleAllQuery = () => {
  const { data: articles = [], ...query } = trpc.article.all.useQuery({ take: 999 })
  return { articles, ...query }
}
