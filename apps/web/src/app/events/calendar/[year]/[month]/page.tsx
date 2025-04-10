import { EventCalendar } from "@/components/organisms/EventCalendar"
import { redirect } from "next/navigation"

const EventPage = async ({ params }: { params: Promise<{ year: number; month: number }> }) => {
  const { year, month } = await params

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    redirect("/events/calendar") // Redirects to current month if invalid
  }

  return (
    <>
      <h1 className="py-6">Arrangement</h1>
      <EventCalendar year={year} month={month - 1} />
    </>
  )
}

export default EventPage
