import { type EventId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventGetQuery = (id: EventId) => {
  const { data, ...query } = trpc.event.get.useQuery(id)

  const event = data?.event ?? null
  const eventCommittees = data?.eventCommittees ?? []

  return { event, eventCommittees, ...query }
}
