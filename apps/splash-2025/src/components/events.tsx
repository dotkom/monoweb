import { trpc } from "@/lib/trpc"
import type { Event } from "@dotkomonline/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Icon, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { compareAsc, formatDate, getDate } from "date-fns"

const baseUrl = import.meta.env.VITE_WEB_URL || "http://localhost:3000"

export const Events = () => {
  const { data: events, isLoading } = useQuery(
    trpc.event.all.queryOptions({ filter: { byOrganizingGroup: ["velkom"] }, page: { take: 10000 } })
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
      const month = formatDate(eventDetail.start, "MMMM")
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
        <Title id="events-title" size="lg" className="text-4xl px-8 md:px-16">
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

                <div className="space-y-12 text-orange-900">
                  {eventsInMonth.entries().map(([date, events]) => (
                    <div className="space-y-4" key={`${month}-${date}`}>
                      <Text
                        className={cn(
                          "text-orange-800/80 uppercase font-bold text-xs",
                          "max-sm:relative w-fit max-sm:left-1/4 sm:w-1/4 sm:pr-12 sm:text-right mb-3 sm:-mb-0.5"
                        )}
                      >
                        {events[0] ? formatDate(new Date(events[0]?.start), "EEEE dd.") : "Ukjent ukedag"}
                      </Text>

                      {events.map((event) => (
                        <div key={event.id} className="flex flex-row items-center">
                          <div className="w-1/4" />
                          <div className="w-3/4">
                            <Collapsible className="group">
                              <CollapsibleTrigger className="[&[data-state=open]>div>iconify-icon]:rotate-90">
                                <div className="relative flex flex-row items-center gap-2 transition-colors p-2 -m-2 rounded-lg hover:bg-orange-200/50 group-data-[state=open]:bg-orange-200/25">
                                  {/* The dot for the event. The pixel offsets need to be synced with the vertical lines */}
                                  <div className="absolute -left-[10px] md:-left-[18px] top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-3 w-3 rounded-2xl bg-yellow-800" />
                                  </div>

                                  <Text className="absolute text-right -left-[calc(50px)] md:-left-[60px] top-1/2 transform -translate-x-1/2 -translate-y-1/2 group-data-[state=open]:font-medium">
                                    {formatDate(event.start, "HH:mm")}
                                  </Text>

                                  <Icon
                                    icon="tabler:chevron-right"
                                    className="transition-transform text-xl w-fit text-yellow-800"
                                  />
                                  <img
                                    src={event.imageUrl ?? "https://placehold.co/120x90/fdba74/854d0e/?text=Online"}
                                    alt={event.title}
                                    className="w-14 h-auto aspect-4/3 object-cover rounded-sm hidden sm:block"
                                  />
                                  <Text className="text-lg/5 text-left group-data-[state=open]:font-medium">
                                    {event.title}
                                  </Text>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="relative md:ml-23 mt-3 overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                <RichText content={event.description ?? "<p>Ingen beskrivelse</p>"} />

                                <div className="flex flex-col gap-4 md:flex-row my-4 md:my-2 text-black">
                                  <a
                                    href={event.locationLink ?? undefined}
                                    className="flex flex-row items-center w-fit gap-3 px-3 py-2 rounded-lg min-h-14 bg-indigo-200/35 hover:bg-indigo-200/65 transition-colors"
                                  >
                                    <Icon icon="tabler:map-pin-filled" className="text-lg text-indigo-800/75" />
                                    <div className="flex flex-col gap-0">
                                      <Text>{event.locationTitle ?? "Gå til kart"}</Text>
                                      {event.locationAddress ? (
                                        <Text className="text-xs">{event.locationAddress}</Text>
                                      ) : null}
                                    </div>
                                    <Icon icon="tabler:arrow-up-right" className="text-lg" />
                                  </a>

                                  <a
                                    href={`${baseUrl}/arrangementer/${slugify(event.title)}/${event.id}`}
                                    className={cn(
                                      "flex flex-row items-center w-fit gap-3 px-3 py-2 rounded-lg transition-colors min-h-14",
                                      event.attendanceId
                                        ? "bg-indigo-300 hover:bg-indigo-200"
                                        : "max-sm:bg-indigo-200/35 max-sm:hover:bg-indigo-200/65 sm:hover:bg-indigo-200/35"
                                    )}
                                  >
                                    <Text>Gå til {event.attendanceId ? "påmelding" : "arrangement"}</Text>
                                    <Icon icon="tabler:arrow-up-right" className="text-lg" />
                                  </a>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
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
