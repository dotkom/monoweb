import type { Event } from "@dotkomonline/rpc/event"
import { Text, Title } from "@dotkomonline/ui"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { tz } from "@date-fns/tz"
import { format, isSameDay, isValid } from "date-fns"
import { nb } from "date-fns/locale"

interface EventDetailsFooterProps {
  event: Event
}

export function EventDetailsFooter({ event }: EventDetailsFooterProps) {
  const locationTitle = event.locationTitle ?? ""
  const locationAddress = event.locationAddress ?? ""
  const isLocationPresent = locationTitle !== "" || locationAddress !== ""
  const isTimeValid = isValid(event.start) && isValid(event.end)

  if (isLocationPresent === false && isTimeValid === false) {
    return null
  }

  const dateOptions = {
    locale: nb,
    in: tz("Europe/Oslo"),
  }

  let timeDescription: string | null = null

  if (isTimeValid) {
    const isSingleDayEvent = isSameDay(event.start, event.end, dateOptions)
    const startLabel = capitalizeFirstLetter(format(event.start, "EEEE d. MMMM yyyy 'kl.' HH:mm", dateOptions))
    const endFormat = isSingleDayEvent ? "HH:mm" : "EEEE d. MMMM yyyy 'kl.' HH:mm"
    const endLabel = format(event.end, endFormat, dateOptions)
    const timezone = format(event.start, "z", dateOptions)

    timeDescription = `${startLabel} - ${endLabel} ${timezone}`
  }

  return (
    <footer className="mt-4 flex min-w-0 flex-col gap-6 border-t border-field-border pt-8 text-muted-foreground">
      <div className="flex flex-col gap-3">
        <Text className="text-sm">
          Ta kontakt med arrangørene hvis du har spørsmål eller oppdager feil i arrangementsinformasjonen.
        </Text>

        <Text className="text-sm">
          Når du melder deg på eller deltar på arrangementet, godtar du{" "}
          <a href="https://wiki.online.ntnu.no/online-info/prikkeregler/" className="underline">
            arrangementsreglene
          </a>
          .{" "}
        </Text>
      </div>

      {timeDescription !== null && (
        <section className="flex min-w-0 flex-col gap-1">
          <Title className="text-xs font-semibold">Tid</Title>
          <Text className="col-start-2 wrap-break-word text-sm">{timeDescription}</Text>
        </section>
      )}

      {isLocationPresent && (
        <section className="flex min-w-0 flex-col gap-1">
          <Title className="text-xs font-semibold">Sted</Title>
          {locationTitle !== "" && <Text className="col-start-2 wrap-break-word text-sm">{locationTitle}</Text>}
          {locationAddress !== "" && <Text className="col-start-2 wrap-break-word text-sm">{locationAddress}</Text>}
        </section>
      )}
    </footer>
  )
}
