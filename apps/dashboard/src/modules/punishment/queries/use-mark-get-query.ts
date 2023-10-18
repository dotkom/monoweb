import { trpc } from "../../../utils/trpc"
import { MarkId } from "@dotkomonline/types"

export const useMarkGetQuery = (id: MarkId) => {
  const { data, ...query } = trpc.mark.get.useQuery(id)

  const mark = data ?? null

  return { mark, ...query }
}
