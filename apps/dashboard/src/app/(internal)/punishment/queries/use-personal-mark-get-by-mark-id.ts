import type { MarkId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data: personalMarks, ...query } = useQuery({
    ...trpc.personalMark.getByMark.queryOptions({
      markId,
    }),
    initialData: [],
  })
  return { personalMarks, ...query }
}
