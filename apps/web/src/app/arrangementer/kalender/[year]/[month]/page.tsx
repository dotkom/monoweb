import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventCalendar } from "@/components/organisms/EventCalendar"
import { Title } from "@dotkomonline/ui"
import { redirect } from "next/navigation"

const EventPage = async ({ params }: { params: Promise<{ year: number; month: number }> }) => {
  const { year, month } = await params

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    redirect("/arrangementer/kalender") // Redirects to current month if invalid
  }

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <div className="flex flex-col gap-4">
        <EventsViewToggle active="cal" />
        <EventCalendar year={year} month={month - 1} />
      </div>
    </div>
  )
}

export default EventPage
