import { trpc } from "../../../utils/trpc"
import { MarkId } from "@dotkomonline/types"

export const useMarkCountUsersQuery = (id: MarkId) => {
  const { data, ...query } = trpc.personalMark.countUsersWithMark.useQuery({ id })
  return { data, ...query }
}
