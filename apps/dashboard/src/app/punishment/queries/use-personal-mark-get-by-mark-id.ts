import { useTRPC } from "@/lib/trpc"
import type { MarkId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data: personalMarks, ...query } = useQuery({
    ...trpc.personalMark.getByMark.queryOptions({
      id: markId,
    }),
    initialData: [],
  })
  return { personalMarks, ...query }
}
