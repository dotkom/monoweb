import { EventCalendar } from "@/components/organisms/EventCalendar"

export default async function EventPage() {
  const now = new Date()

  return (
    <>
      <h1 className="py-6">Arrangement</h1>
      <EventCalendar year={now.getFullYear()} month={now.getMonth()} />
    </>
  )
}
