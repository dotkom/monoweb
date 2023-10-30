import { trpc } from "../../../utils/trpc"

export const usePunishmentAllQuery = () => {
  const { data: marks = [], ...query } = trpc.mark.all.useQuery({ take: 50 })
  return { marks, ...query }
}
