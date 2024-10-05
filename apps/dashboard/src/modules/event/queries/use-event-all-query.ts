import { trpc } from "../../../trpc"

export const useEventAllQuery = () => {
  const { data: events = [], ...query } = trpc.event.all.useQuery({ take: 50 })
  return { events, ...query }
}
