import { trpc } from "@/lib/trpc"
import type { Event } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { compareAsc, formatDate, getDate } from "date-fns"
import { nb } from "date-fns/locale"

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
    .toSorted((a, b) => compareAsc(a.start, b.start))
    .reduce((acc, eventDetail) => {
      const month = formatDate(eventDetail.start, "MMMM", { locale: nb })
      const date = getDate(eventDetail.start)

      const eventsInMonth = acc.get(month) || new Map<number, Event[]>()
      const eventsInDate = eventsInMonth.get(date) || []

      eventsInDate.push(eventDetail)
      eventsInMonth.set(date, eventsInDate)
      acc.set(month, eventsInMonth)

      return acc
    }, new Map<string, Map<number, Event[]>>())

  return (
    <div className="bg-white min-h-[500px] w-full">
      <div className="relative max-w-screen-xl py-20 px-8 md:px-16 mx-auto">
        <div className="absolute inset-y-0 left-1/4 w-1 rounded-full bg-gray-300" />

        <div className="space-y-18">
          {eventsByDate.entries().map(([month, eventsInMonth]) => (
            <div key={month} className="space-y-4">
              <div className="w-1/4 pr-12 flex justify-end-safe">
                <Text className="relative w-fit z-1 text-2xl font-bold capitalize p-1 -m-1 bg-white rounded-md">
                  {month}
                </Text>
              </div>

              <div className="space-y-12">
                {eventsInMonth.entries().map(([date, events]) => (
                  <div className="space-y-4" key={`${month}-${date}`}>
                    <Text className="text-gray-500 uppercase font-bold text-xs max-sm:relative max-sm:left-1/4 sm:w-1/4 sm:pr-12 sm:text-right mb-1 sm:-mb-0.5">
                      {events[0] ? formatDate(new Date(events[0]?.start), "EEEE dd.", { locale: nb }) : "Ukjent ukedag"}
                    </Text>

                    {events.map((event) => (
                      <div key={event.id} className="flex items-center">
                        <Text className="w-1/4 pr-12 text-right">
                          {formatDate(event.start, "HH:mm", { locale: nb })}
                        </Text>

                        <div className="relative w-3/4">
                          <div className="absolute -left-[14px] md:-left-[30px] top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="h-3 w-3 rounded-full bg-brand" />
                          </div>

                          <a
                            /* TODO: update href */
                            href={`http://localhost:3000/arrangementer/${slugify(event.title)}/${event.id}`}
                            className="flex items-center gap-2 transition-colors p-2 -m-2 rounded-lg hover:bg-gray-100"
                          >
                            <img
                              src={event.imageUrl ?? "https://placehold.co/120x90?text=Online"}
                              alt={event.title}
                              className="w-14 h-auto aspect-4/3 object-cover rounded-sm"
                            />
                            <Text className="text-lg/5">{event.title}</Text>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
