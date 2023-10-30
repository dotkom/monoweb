import { CompanyId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const { data: companyEvents = [], ...query } = trpc.company.event.get.useQuery({
    id: id,
  })

  return { companyEvents, ...query }
}
