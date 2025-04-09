import EventCalendar from "@/components/organisms/EventCalendar"

const EventPage = async () => {
  const now = new Date()

  return (
    <>
      <h1 className="py-6">Arrangement</h1>
      <EventCalendar year={now.getFullYear()} month={now.getMonth()} />
    </>
  )
}

export default EventPage
