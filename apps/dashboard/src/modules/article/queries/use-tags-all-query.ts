import { useTRPC } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"

export const useTagsAllQuery = () => {
  const trpc = useTRPC()
  const { data: tags, ...query } = useQuery({
    ...trpc.article.getTags.queryOptions(),
    initialData: [],
  })

  return { tags, ...query }
}
