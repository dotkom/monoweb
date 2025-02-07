import { redirect } from 'next/navigation';
import { getCalendarArray } from "@/components/organisms/EventCalendar/getCalendarArray"
import EventCalendar from "@/components/organisms/EventCalendar"
import { server } from '@/utils/trpc/server';

const EventPage = async ({ params }: { params: Promise<{ year: number; month: number }> }) => {
    const { year, month } = await params;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        redirect('/events/calendar'); // Redirects to current month if invalid
    }

    // TODO: get all events between to given dates (start and end of month inc. days from adjesent months to fill first and last week)
    const events = await server.event.all.query({take: 50})

    // -1 because zero indexed months
    let cal = getCalendarArray(year, month - 1, events)
    
    return (
        <>
            <h1 className="py-6">Arrangement</h1>
            <EventCalendar cal={cal} />
        </>
    );
};

export default EventPage