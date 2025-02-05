import type { CompanyId } from "@dotkomonline/types"
import { trpc } from "../../../trpc"

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const { data: companyEvents = [], ...query } = trpc.company.event.get.useQuery({
    id,
  })

  return { companyEvents, ...query }
}
