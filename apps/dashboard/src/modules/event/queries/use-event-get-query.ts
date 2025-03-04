import type { EventId } from "@dotkomonline/types"
import { trpc } from "../../../trpc"

export const useEventDetailsGetQuery = (id: EventId) => {
  const { data, ...query } = trpc.event.getAttendanceEventDetail.useQuery(id)
  return { data, ...query }
}
