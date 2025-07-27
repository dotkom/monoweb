import { trpc } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"

export const Events = () => {
  const { data: events, ...query } = useQuery(trpc.event.all.queryOptions())
  if (events === undefined || query.isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full bg-white h-[500px] p-4 overflow-y-auto">
      {events.map((event) => (
        // show nice formatted json
        <pre key={event.id}>{JSON.stringify(event, null, 2)}</pre>
      ))}
    </div>
  )
}
