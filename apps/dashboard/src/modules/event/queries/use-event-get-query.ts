import type { EventId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventDetailsGetQuery = (id: EventId) => {
  const { data, ...query } = trpc.event.getEventDetailData.useQuery(id)
  return { data, ...query }
}
