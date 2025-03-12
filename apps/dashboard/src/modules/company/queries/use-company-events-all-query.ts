import type { CompanyId } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useCompanyEventsAllQuery = (id: CompanyId) => {
  const trpc = useTRPC()
  const { data: companyEvents = [], ...query } = useQuery(
    trpc.company.event.get.queryOptions({
      id,
    })
  )

  return { companyEvents, ...query }
}
