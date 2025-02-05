import { EventList } from "@/components/organisms/EventList"
import { server } from "@/utils/trpc/server"
import { getCalendarArray } from "@/components/organisms/EventCalendar/getCalendarArray"
import EventCalendar from "@/components/organisms/EventCalendar"
import type { Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"

let events: Event[] = [
  {
    id: "01HJK8Z5N2X4M1V0A9Q7D6B3C5",
    createdAt: new Date("2025-02-01T10:00:00Z"),
    updatedAt: new Date("2025-02-03T10:00:00Z"),
    title: "New Year's Networking",
    start: new Date("2025-02-02T18:00:00Z"),
    end: new Date("2025-02-04T22:00:00Z"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Kick off the new year with networking and fun!",
    subtitle: "A social start to 2025",
    imageUrl: null,
    locationAddress: "123 Event St, Oslo, Norway",
    locationLink: null,
    locationTitle: "Oslo Event Hall",
    attendanceId: null,
  },
  {
    id: "01HJK8Z5N2X4M1V0A9Q7D65",
    createdAt: new Date("2025-02-01T10:00:00Z"),
    updatedAt: new Date("2025-02-03T10:00:00Z"),
    title: "New Year's Networking",
    start: new Date("2025-02-03T18:00:00Z"),
    end: new Date("2025-02-03T22:00:00Z"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Kick off the new year with networking and fun!",
    subtitle: "A social start to 2025",
    imageUrl: null,
    locationAddress: "123 Event St, Oslo, Norway",
    locationLink: null,
    locationTitle: "Oslo Event Hall",
    attendanceId: null,
  },
  {
    id: "01HJK8Z5N2X4M1V0A9Q7D6B3C",
    createdAt: new Date("2025-02-01T10:00:00Z"),
    updatedAt: new Date("2025-02-03T10:00:00Z"),
    title: "New Year's Networking",
    start: new Date("2025-02-02T18:00:00Z"),
    end: new Date("2025-02-06T22:00:00Z"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Kick off the new year with networking and fun!",
    subtitle: "A social start to 2025",
    imageUrl: null,
    locationAddress: "123 Event St, Oslo, Norway",
    locationLink: null,
    locationTitle: "Oslo Event Hall",
    attendanceId: null,
  },
  {
    id: "01HJK8Z5N2X4M1V0A9Q7D6B3",
    createdAt: new Date("2025-02-01T10:00:00Z"),
    updatedAt: new Date("2025-02-03T10:00:00Z"),
    title: "New Year's Networking",
    start: new Date("2025-02-02T18:00:00Z"),
    end: new Date("2025-02-03T22:00:00Z"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Kick off the new year with networking and fun!",
    subtitle: "A social start to 2025",
    imageUrl: null,
    locationAddress: "123 Event St, Oslo, Norway",
    locationLink: null,
    locationTitle: "Oslo Event Hall",
    attendanceId: null,
  },
  {
    id: "01HJK9A7M2X5L0V8B6D4C3N9Q2",
    createdAt: new Date("2025-01-10T12:00:00Z"),
    updatedAt: new Date("2025-01-10T12:00:00Z"),
    title: "Company Strategy Retreat",
    start: new Date("2025-02-15T09:00:00Z"),
    end: new Date("2025-02-20T17:00:00Z"),
    status: "ATTENDANCE",
    type: "COMPANY",
    public: false,
    description: "A week-long retreat to discuss company strategy.",
    subtitle: "Strategic planning for the year ahead",
    imageUrl: null,
    locationAddress: "Mountain Resort, Lillehammer, Norway",
    locationLink: null,
    locationTitle: "Lillehammer Retreat Center",
    attendanceId: "A1B2C3D4E5F6G7H8I9J0",
  },
  {
    id: "01HJKBA9X2M5V0L8D7C6N4Q3A2",
    createdAt: new Date("2025-02-05T15:00:00Z"),
    updatedAt: new Date("2025-02-05T15:00:00Z"),
    title: "Academic Seminar: AI Trends",
    start: new Date("2025-02-10T10:00:00Z"),
    end: new Date("2025-02-10T16:00:00Z"),
    status: "PUBLIC",
    type: "ACADEMIC",
    public: true,
    description: "Exploring the latest trends in AI research and development.",
    subtitle: "Insights from industry and academia",
    imageUrl: null,
    locationAddress: "Tech University, Trondheim, Norway",
    locationLink: null,
    locationTitle: "Trondheim Lecture Hall",
    attendanceId: null,
  },
  {
    id: "01HJKC7N3X5M8V0L2D9Q6A4B1C",
    createdAt: new Date("2025-02-20T08:00:00Z"),
    updatedAt: new Date("2025-02-20T08:00:00Z"),
    title: "Winter Bedpres 2025",
    start: new Date("2025-02-25T17:00:00Z"),
    end: new Date("2025-02-25T20:00:00Z"),
    status: "NO_LIMIT",
    type: "BEDPRES",
    public: true,
    description: "Company presentations and networking opportunities for students.",
    subtitle: "Meet your future employer",
    imageUrl: null,
    locationAddress: "Student Center, Bergen, Norway",
    locationLink: null,
    locationTitle: "Bergen Student Center",
    attendanceId: null,
  }
];

const EventPage = async () => {

  // const events = await server.event.all({take: 50})

  const now = new Date();

  let cal = getCalendarArray(now.getFullYear(), now.getMonth(), events)

  console.log(cal.weeks[0].events[0])
  
  return (
    <>
      <h1>Arrangement</h1>
      <div className="text-foreground bg-slate-3 inline-flex items-center justify-center rounded-md p-1 my-4">
        <div
          className="text-slate-12 bg-slate-2 shadow-sm inline-flex items-center justify-center rounded-[0.185rem] px-3 py-1.5"
        >
          <Icon icon="tabler:layout-list" width={22} height={22} />
        </div>
        <a 
          href="/events/calendar"
          className="text-slate-9 inline-flex items-center justify-center rounded-[0.185rem] px-3 py-1.5 transition-all cursor-pointer hover:text-slate-12"
        >
          <Icon icon="tabler:calendar-month" width={22} height={22} />
        </a>
      </div>
      <EventList events={events} />
    </>
  );
};

export default EventPage
