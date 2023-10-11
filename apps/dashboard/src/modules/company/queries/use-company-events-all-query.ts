import { type Company } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useCompanyEventsAllQuery = (id: Company["id"]) => {
  const { data: companyEvents = [], ...query } = trpc.company.event.get.useQuery({
    id,
  })

  return { companyEvents, ...query }
}
