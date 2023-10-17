import { trpc } from "../../../utils/trpc"

export const useUserAllQuery = () => {
  const { data: users = [], ...query } = trpc.user.all.useQuery()
  return { users, ...query }
}
