import type { EventId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../../../trpc"

export const useEventAllQuery = () => {
  const trpc = useTRPC()
  const { data: events = [], ...query } = useQuery(trpc.event.all.queryOptions({ take: 50 }))
  return { events, ...query }
}

export const useEventCompanyGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data: eventCompanies = [], ...query } = useQuery(
    trpc.event.company.get.queryOptions({
      id,
    })
  )
  return { eventCompanies, ...query }
}

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.event.getAttendanceEventDetail.queryOptions(id))
  return { data, ...query }
}
