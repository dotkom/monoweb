import { trpc } from "@/utils/trpc"
import { MainEventPane } from "@/components/organisms/EventsPane/MainEventPane"
import { SecondaryEvent } from "@/components/organisms/EventsPane/SecondaryEvent"

export function EventsPane() {
  const { data: events } = trpc.event.allOrderedByDate.useQuery()

  const mainEvent = events?.[0]
  const secondaryEvents = Array.from({ length: 4 }, () => events?.[1])

  return (
    <div className="my-10 flex flex-1 flex-col items-center justify-center">
      <div className="flex w-[80vw] flex-col gap-4 md:flex-row">
        <div className="md:w-1/2">{mainEvent && <MainEventPane event={mainEvent} />}</div>
        <div className="max-h overflow-y-scroll md:w-1/2">
          {secondaryEvents
            .filter((event) => event)
            .map((event, i) => (
              <SecondaryEvent event={event} key={event?.id ?? i} />
            ))}
        </div>
      </div>
      <div className="h-[50vh]" />
    </div>
  )
}
