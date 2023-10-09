import { trpc } from "../../../utils/trpc"
import { EventId } from "@dotkomonline/types"

export const useEventCommitteeGetQuery = (id: EventId) => {
  const { data: eventCommittiees = [], ...query } = trpc.event.committee.get.useQuery({
    id,
  })
  return { eventCommittiees, ...query }
}
