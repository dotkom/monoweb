import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventCalendar } from "@/components/organisms/EventCalendar"
import { Title } from "@dotkomonline/ui"

export default async function EventCalendarPage() {
  const now = new Date()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <div className="flex flex-col">
        <EventsViewToggle active="cal" />
        <EventCalendar year={now.getFullYear()} month={now.getMonth()} />
      </div>
    </div>
  )
}
