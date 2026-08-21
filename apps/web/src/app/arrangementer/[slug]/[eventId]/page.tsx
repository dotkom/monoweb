import { getServerSession } from "@/auth"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Company } from "@dotkomonline/rpc/company"
import type { Event } from "@dotkomonline/rpc/event"
import { type Group, createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { User } from "@dotkomonline/rpc/user"
import { Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import {
  createAbsoluteEventPageUrl,
  createEventPageUrl,
  createEventSlug,
  richTextToPlainText,
} from "@dotkomonline/utils"
import { isPast } from "date-fns"
import type { Metadata } from "next"
import Link from "next/link"
import { RedirectType, notFound, permanentRedirect } from "next/navigation"
import { AttendanceCard } from "../../components/AttendanceCard/AttendanceCard"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import { EventDescription } from "../../components/EventDescription"
import { EventHeader } from "../../components/EventHeader"
import { EventList } from "../../components/EventList"
import { LocationBox } from "../../components/TimeLocationBox/LocationBox"
import { TimeBox } from "../../components/TimeLocationBox/TimeBox"

const createOrganizerPageUrl = (item: Group | Company) => {
  if ("type" in item) {
    return createGroupPageUrl(item)
  }

  return `/bedrifter/${item.slug}`
}

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

  if (!eventDetail) {
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
      <EventHeader event={event} showDashboardLink={isOrganizer || isAdmin} />

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
                futureEventWithAttendances={futureChildEventWithAttendances}
                pastEventWithAttendances={pastChildEventsWithAttendances}
                alwaysShowChildEvents
                viewMode="CHRONOLOGICAL"
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
  attendance: Attendance | null
  parentEvent: Event | null
  parentAttendance: Attendance | null
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
    <div className="flex w-full flex-col gap-8 md:flex-row text-base">
      <div className="w-full flex flex-col gap-6 md:w-[60%]">
        {parentEvent && (
          <div className="flex flex-col gap-1 p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-0 dark:bg-stone-800">
            <Title element="h4" size="sm" className="text-base">
              Arrangementet er en del av
            </Title>
            <EventListItem event={parentEvent} attendance={parentAttendance} userId={user?.id ?? null} />
          </div>
        )}

        <section>
          <Title element="h2" className="sr-only">
            Oppmøte
          </Title>
          <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-3 min-[1150px]:grid-cols-2">
            <TimeBox event={event} />
            <LocationBox event={event} />
          </div>
        </section>

        {event.hostingGroups.length > 0 || event.companies.length > 0 ? (
          <div className="flex flex-row gap-6 items-center">
            {event.hostingGroups.map((group) => (
              <OrganizerPill key={group.slug} item={group} />
            ))}

            {event.companies.map((company) => (
              <OrganizerPill key={company.id} item={company} />
            ))}
          </div>
        ) : (
          <Text className="text-gray-900 dark:text-stone-400">Ingen arrangører</Text>
        )}

        {event.description && <EventDescription description={event.description} />}
      </div>

      <div className="flex flex-1 flex-col gap-8 sm:gap-4 md:min-w-88 lg:min-w-104">
        {attendance !== null && (
          <>
            <div className="sm:hidden h-1 rounded-full w-full bg-gray-200 dark:bg-stone-700" />

            <AttendanceCard
              initialAttendance={attendance}
              initialRegistrationAvailability={registrationAvailability}
              parentEvent={parentEvent}
              user={user}
              event={event}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface OrganizerPillProps {
  item: Group | Company
}

function OrganizerPill({ item }: OrganizerPillProps) {
  const displayName = "type" in item ? getGroupDisplayName(item) : item.name

  return (
    <Link
      href={createOrganizerPageUrl(item)}
      key={item.name}
      className="group/organizer-pill flex flex-row gap-2.5 items-center p-1.5 -mx-1.5 rounded-md transition-colors border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
    >
      {item.imageUrl && (
        <GroupLogo
          src={item.imageUrl}
          alt={displayName}
          width={22}
          height={22}
          containerClassName="rounded-sm p-0.5 size-5.5"
        />
      )}

      <Text className="text-sm font-medium text-muted-foreground group-hover/organizer-pill:text-foreground">
        {displayName}
      </Text>
    </Link>
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
