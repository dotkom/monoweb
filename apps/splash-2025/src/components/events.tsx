import { trpc } from "@/lib/trpc"
import type { Event } from "@dotkomonline/types"
import { Icon, Text, Title, cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { compareAsc, formatDate, getDate } from "date-fns"
import { nb } from "date-fns/locale"

const baseUrl = import.meta.env.VITE_WEB_URL || "http://localhost:3000"

export const Events = () => {
  const { data: events, isLoading } = useQuery(
    trpc.event.all.queryOptions({ filter: { byOrganizingGroup: ["velkom"] } })
  )

  if (isLoading) {
    return (
      <div className="bg-orange-100 min-h-[500px] w-full flex gap-2 justify-center items-center">
        <Icon icon="tabler:loader-2" className="animate-spin text-2xl" />
        <Text className="text-2xl">Laster...</Text>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-orange-100 min-h-[500px] w-full flex gap-2 justify-center items-center">
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
    <div className="bg-orange-100 min-h-[500px] py-20 w-full">
      <div className="max-w-screen-xl mx-auto space-y-8">
        <Title size="lg" className="text-4xl px-8 md:px-16">
          Arrangementer
        </Title>

        <div className="px-8 md:px-16">
          <div className="space-y-18">
            {eventsByDate.entries().map(([month, eventsInMonth]) => (
              <div key={month} className="relative space-y-4">
                {/* The vertical line */}
                <div
                  className={cn(
                    "absolute w-1 rounded-full bg-orange-200",
                    "top-10 -bottom-10 transform -translate-x-1/2",
                    // 25 % is to align with event card
                    // -18px/-26px is to align with the dot
                    "left-[calc(25%-18px)] md:left-[calc(25%-26px)] "
                  )}
                />

                <Text
                  className={cn(
                    "text-2xl font-bold capitalize",
                    "sm:w-1/4 sm:pr-12 max-sm:relative sm:flex sm:justify-end-safe"
                  )}
                >
                  {month}
                </Text>

                <div className="space-y-12">
                  {eventsInMonth.entries().map(([date, events]) => (
                    <div className="space-y-4" key={`${month}-${date}`}>
                      <Text
                        className={cn(
                          "text-orange-800 uppercase font-bold text-xs",
                          "max-sm:relative max-sm:left-1/4 sm:w-1/4 sm:pr-12 sm:text-right mb-1 sm:-mb-0.5"
                        )}
                      >
                        {events[0]
                          ? formatDate(new Date(events[0]?.start), "EEEE dd.", { locale: nb })
                          : "Ukjent ukedag"}
                      </Text>

                      {events.map((event) => (
                        <div key={event.id} className="flex items-center">
                          <Text className="w-1/4 pr-12 text-right">
                            {formatDate(event.start, "HH:mm", { locale: nb })}
                          </Text>

                          <div className="relative w-3/4">
                            {/* The dot for the event. The pixel offsets need to be synced with the vertical line */}
                            <div className="absolute -left-[18px] md:-left-[26px] top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="h-3 w-3 rounded-full bg-yellow-800" />
                            </div>

                            <a
                              href={`${baseUrl}/arrangementer/${slugify(event.title)}/${event.id}`}
                              className="flex items-center gap-2 transition-colors p-2 -m-2 rounded-lg hover:bg-orange-200/50"
                            >
                              <img
                                src={event.imageUrl ?? "https://placehold.co/120x90/fdba74/854d0e/?text=Online"}
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
    </div>
  )
}
