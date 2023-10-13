import { trpc } from "../../../utils/trpc"

export const useUserGetQuery = (id: string) => {
  const { data: user, ...query } = trpc.user.get.useQuery(id)
  return { user, ...query }
}
