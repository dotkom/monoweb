import type { EventDetail } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { compareAsc, formatDate, getDate } from "date-fns"
import { nb } from "date-fns/locale"
import { trpc } from "../lib/trpc"

export const Events = () => {
  // TODO: filter by "Velkom"
  const { data: events, isLoading } = useQuery(trpc.event.all.queryOptions())

  if (isLoading) {
    return (
      <div className="bg-white min-h-[500px] w-full flex gap-2 justify-center items-center">
        <Icon icon="tabler:loader-2" className="animate-spin text-2xl" />
        <Text className="text-2xl">Laster...</Text>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white min-h-[500px] w-full flex gap-2 justify-center items-center">
        <Text className="text-2xl">Ingen arrangementer funnet</Text>
      </div>
    )
  }

  const eventsByDate = events
    .toSorted((a, b) => compareAsc(a.event.start, b.event.start))
    .reduce((acc, eventDetail) => {
      const month = formatDate(eventDetail.event.start, "MMMM", { locale: nb })
      const date = getDate(eventDetail.event.start)

      const eventsInMonth = acc.get(month) || new Map<number, EventDetail[]>()
      const eventsInDate = eventsInMonth.get(date) || []

      eventsInDate.push(eventDetail)
      eventsInMonth.set(date, eventsInDate)
      acc.set(month, eventsInMonth)

      return acc
    }, new Map<string, Map<number, EventDetail[]>>())

  return (
    <div className="w-full bg-white h-[500px] p-4 overflow-y-auto">
      {events.map((event) => (
        // show nice formatted json
        <pre key={event.id}>{JSON.stringify(event, null, 2)}</pre>
      ))}
    </div>
  )
}
