import type { MarkId } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const usePersonalMarkGetByMarkId = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data: personalMarks = [], ...query } = useQuery(
    trpc.personalMark.getByMark.queryOptions({
      id: markId,
    })
  )
  return { personalMarks, ...query }
}
