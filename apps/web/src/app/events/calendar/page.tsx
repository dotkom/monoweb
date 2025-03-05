import { getCalendarArray } from "@/components/organisms/EventCalendar/getCalendarArray"
import EventCalendar from "@/components/organisms/EventCalendar"
import { server } from "@/utils/trpc/server";

const EventPage = async () => {
  // TODO: get all events between to given dates for the current month
  const events = await server.event.all.query({take: 50})

  const now = new Date();

  let cal = getCalendarArray(now.getFullYear(), now.getMonth(), events)
  
  return (
    <>
      <h1 className="py-6">Arrangement</h1>
      <EventCalendar cal={cal} />
    </>
  );
};

export default EventPage