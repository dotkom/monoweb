import { useQuery } from "@tanstack/react-query"
import { trpc } from "../lib/trpc"
import { Timeline } from "./timeline/timeline"

export const Events = () => {
  const { data, ...query } = useQuery(trpc.event.all.queryOptions())

	const splashEvents = data?.filter(event => event.event.splashVisible === true).map(event => event.event)

  if (splashEvents === undefined || query.isLoading) {
    return <div>Loading...</div>
  }

	console.log(data)

  return (
			<Timeline events={splashEvents} />
  )
}
