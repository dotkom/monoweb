import { getServerClient } from "@/utils/trpc/serverClient"
import { getCalendarArray } from "@/components/organisms/EventCalendar/getCalendarArray"
import EventCalendar from "@/components/organisms/EventCalendar"
import { Icon } from "@dotkomonline/ui"

const EventPage = async () => {

  const serverClient = await getServerClient()

  // TODO: get all events between to given dates for the current month
  const events = await serverClient.event.all({take: 50})

  const now = new Date();

  let cal = getCalendarArray(now.getFullYear(), now.getMonth(), events)
  
  return (
    <>
      <h1>Arrangement</h1>
      <EventCalendar cal={cal} />
    </>
  );
};

export default EventPage