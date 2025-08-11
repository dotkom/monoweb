import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventCalendar } from "@/components/organisms/EventCalendar"
import { Title } from "@dotkomonline/ui"
import { redirect } from "next/navigation"

const EventPage = async ({ params }: { params: Promise<{ year: string; month: string }> }) => {
  const { year, month } = await params

  if (Number.isNaN(year) || Number.isNaN(month) || Number(month) < 1 || Number(month) > 12) {
    redirect("/arrangementer/kalender") // Redirects to current month if invalid
  }

  const parsedYear = year.toString() !== "0" ? year.toString().replace(/^0+/, "") : "0"
  const parsedMonth = month.toString().replace(/^0+/, "").padStart(2, "0")

  if (year !== parsedYear || month !== parsedMonth) {
    redirect(`/arrangementer/kalender/${parsedYear}/${parsedMonth}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <div className="flex flex-col">
        <EventsViewToggle active="cal" />
        <EventCalendar year={Number(year)} month={Number(month) - 1} />
      </div>
    </div>
  )
}

export default EventPage
