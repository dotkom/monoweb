import type { EventId } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useEventCompanyGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data: eventCompanies = [], ...query } = useQuery(
    trpc.event.company.get.queryOptions({
      id,
    })
  )
  return { eventCompanies, ...query }
}
