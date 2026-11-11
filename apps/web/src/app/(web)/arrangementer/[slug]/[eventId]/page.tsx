import { getServerSession } from "@/auth"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import type { AttendanceView } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { User } from "@dotkomonline/rpc/user"
import { Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import {
  createAbsoluteEventPageUrl,
  createEventPageUrl,
  createEventSlug,
  richTextToPlainText,
} from "@dotkomonline/utils"
import { isPast } from "date-fns"
import type { Metadata } from "next"
import { RedirectType, notFound, permanentRedirect } from "next/navigation"
import { AttendanceCard } from "../../components/AttendanceCard/AttendanceCard"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import { EventDescription } from "../../components/EventDescription"
import { EventDetailsFooter } from "../../components/EventDetailsFooter"
import { EventHeader } from "../../components/EventHeader"
import { EventList } from "../../components/EventList"
import { LocationBox } from "../../components/TimeLocationBox/LocationBox"
import { TimeBox } from "../../components/TimeLocationBox/TimeBox"
import { EventSubheader } from "../../components/EventSubheader"

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

interface EventPageParams {
  slug: string
  eventId: string
}

const EventWithAttendancePage = async ({ params }: { params: Promise<EventPageParams> }) => {
  const { slug, eventId } = await params
  const decodedSlug = decodeURIComponent(slug)

  const session = await getServerSession()

  const eventDetail = await server.event.find.query(eventId)

  if (eventDetail === null) {
    notFound()
  }

  const { event, attendance } = eventDetail

  if (decodedSlug !== createEventSlug(event.title)) {
    permanentRedirect(createEventPageUrl(eventId, event.title), RedirectType.replace)
  }

  let user: User | null = null

  if (session !== null) {
    try {
      user = await server.user.findMe.query()
    } catch (error) {
      console.error("[web:event] failed to load user for event page", error)
    }
  }

  const [childEventWithAttendance, parentEventWithAttendance] = await Promise.all([
    server.event.findChildEvents.query({ eventId }),
    server.event.findParentEvent.query({ eventId }),
  ])

  const isOrganizer = user ? await server.event.isOrganizer.query({ eventId }) : false
  const isAdmin = user ? await server.user.isAdmin.query() : false
  const registrationAvailability =
    attendance && user
      ? await server.event.attendance.getRegistrationAvailability.query({
          attendanceId: attendance.id,
        })
      : null

  const parentEvent = parentEventWithAttendance?.event ?? null
  const parentAttendance = parentEventWithAttendance?.attendance ?? null

  const publicChildEvents = childEventWithAttendance.filter(({ event }) => event.status === "PUBLIC")
  const futureChildEventWithAttendances = publicChildEvents.filter(({ event }) => !isPast(event.end))
  const pastChildEventsWithAttendances = publicChildEvents.filter(({ event }) => isPast(event.end))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex min-w-0 flex-col gap-4">
        <EventHeader event={event} />
        <EventSubheader
          event={event}
          isCalendarButtonVisible={attendance === null}
          showAdminLink={isOrganizer || isAdmin}
        />
      </div>

      {publicChildEvents.length > 0 ? (
        <Tabs defaultValue="description">
          <TabsList className="w-full sm:w-fit sm:min-w-95">
            <TabsTrigger className="w-full sm:w-fit" value="description">
              Arrangement
            </TabsTrigger>
            <TabsTrigger className="w-full sm:w-fit" value="child-events">
              Underarrangementer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-0 border-none mt-4">
            <EventContent
              event={event}
              parentEvent={parentEvent}
              attendance={attendance}
              parentAttendance={parentAttendance}
              registrationAvailability={registrationAvailability}
              user={user}
            />
          </TabsContent>

          <TabsContent value="child-events" className="p-0 border-none mt-4">
            <div>
              <EventList
                futureEvents={futureChildEventWithAttendances}
                pastEvents={pastChildEventsWithAttendances}
                userId={user?.id}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <EventContent
          event={event}
          attendance={attendance}
          parentEvent={parentEvent}
          parentAttendance={parentAttendance}
          registrationAvailability={registrationAvailability}
          user={user}
        />
      )}
    </div>
  )
}

interface EventContentProps {
  event: Event
  attendance: AttendanceView | null
  parentEvent: Event | null
  parentAttendance: AttendanceView | null
  registrationAvailability: RegistrationAvailability | null
  user: User | null
}

const EventContent = ({
  event,
  attendance,
  parentEvent,
  parentAttendance,
  registrationAvailability,
  user,
}: EventContentProps) => {
  return (
    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_--spacing(112)] md:grid-rows-[auto_1fr] md:gap-y-6 text-base">
      <div className="min-w-0 flex flex-col gap-6 md:col-start-1 md:row-start-1">
        {parentEvent && (
          <div className="flex flex-col gap-1 p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-0 dark:bg-stone-800">
            <Title element="h4" size="sm" className="text-base">
              Arrangementet er en del av
            </Title>
            <EventListItem event={parentEvent} attendance={parentAttendance} userId={user?.id ?? null} />
          </div>
        )}

        <section className="@container flex flex-col gap-0.5">
          <Title element="h2" className="sr-only">
            Oppmøte
          </Title>

          <div className="grid min-w-0 grid-cols-1 items-start gap-3 md:@min-[33rem]:grid-cols-2">
            <TimeBox event={event} />
            <LocationBox event={event} />
          </div>
        </section>

        {event.description && (
          <div className="mt-2">
            <EventDescription description={event.description} collapse={attendance !== null ? "mobile" : undefined} />
          </div>
        )}
      </div>

      {attendance !== null && (
        <div className="min-w-0 flex flex-col gap-8 sm:gap-4 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="w-full border-t border-field-border md:hidden" />

          <AttendanceCard
            initialAttendance={attendance}
            initialRegistrationAvailability={registrationAvailability}
            parentEvent={parentEvent}
            user={user}
            event={event}
          />
        </div>
      )}

      <div className="min-w-0 md:col-start-1 md:row-start-2">
        <EventDetailsFooter event={event} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<EventPageParams> }): Promise<Metadata> {
  const { eventId } = await params

  const detail = await server.event.find.query(eventId)

  if (!detail) {
    return {
      title: "Arrangement ikke funnet | Linjeforeningen Online",
      description: "Arrangementet finnes ikke eller er ikke offentlig tilgjengelig.",
    }
  }

  const description = richTextToPlainText(detail.event.description)
  const eventUrl = createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, eventId, detail.event.title)

  return {
    title: detail.event.title,
    description,
    openGraph: {
      title: detail.event.title,
      description,
      url: eventUrl,
      siteName: "Linjeforeningen Online",
      images: detail.event.imageUrl
        ? [
            {
              url: detail.event.imageUrl,
              alt: `Banner for ${detail.event.title}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: detail.event.title,
      description,
      images: detail.event.imageUrl ? [detail.event.imageUrl] : undefined,
    },
  }
}

export default EventWithAttendancePage
