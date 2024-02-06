import { type MarkId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useMarkCountUsersQuery = (id: MarkId) => {
  const { data, ...query } = trpc.personalMark.countUsersWithMark.useQuery({ id })
  return { data, ...query }
}
