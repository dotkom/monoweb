import type { MarkId } from "@dotkomonline/types"
import { trpc } from "../../../trpc"

export const useMarkGetQuery = (id: MarkId) => {
  const { data, ...query } = trpc.mark.get.useQuery(id)

  const mark = data ?? null

  return { mark, ...query }
}
