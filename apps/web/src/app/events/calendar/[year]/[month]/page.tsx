import { redirect } from 'next/navigation';
import { getServerClient } from "@/utils/trpc/serverClient"
import { getCalendarArray } from "@/components/organisms/EventCalendar/getCalendarArray"
import EventCalendar from "@/components/organisms/EventCalendar"

const EventPage = async ({ params }: { params: { year: string; month: string } }) => {

    const year = parseInt(params.year);
    const month = parseInt(params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        redirect('/events/calendar'); // Redirects to current month if invalid
    }

    const serverClient = await getServerClient()

    // TODO: get all events between to given dates (start and end of month inc. days from adjesent months to fill first and last week)
    const events = await serverClient.event.all({take: 50})

    // -1 because zero indexed months
    let cal = getCalendarArray(year, month - 1, events)
    
    return (
        <EventCalendar cal={cal} />
    );
};

export default EventPage