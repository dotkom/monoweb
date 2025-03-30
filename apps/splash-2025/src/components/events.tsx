import { useQuery } from "@tanstack/react-query"
import { trpc } from "../lib/trpc"

export const Events = () => {
  const { data, ...query } = useQuery(trpc.event.all.queryOptions())

  if (data === undefined || query.isLoading) {
    return <div>Loading...</div>
  }

  console.log(data)
  return (
    <div className="w-full bg-white h-[500px] p-4 overflow-y-auto">
      {data.map((event) => (
        // show nice formatted json
        <pre key={event.id}>{JSON.stringify(event, null, 2)}</pre>
      ))}
    </div>
  )
}
