import { id } from "date-fns/locale"
import { trpc } from "../../../utils/trpc"

export const useInterestGroupAllQuery = () => {
  const { data: interestGroups = [], ...query } = trpc.interestGroup.all.useQuery({ take: 999 })
  return { interestGroups, ...query }
}
