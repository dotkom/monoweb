import { trpc } from "../../../utils/trpc"

export const useOfflineAllQuery = () => {
  const { data: offlines = [], ...query } = trpc.offline.all.useQuery({ take: 999 })
  return { offlines, ...query }
}
