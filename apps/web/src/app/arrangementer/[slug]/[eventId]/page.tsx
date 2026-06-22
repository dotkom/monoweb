import { getServerSession } from "@/auth"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import {
  type Attendance,
  type Company,
  type Event,
  type Group,
  type User,
  createGroupPageUrl,
} from "@dotkomonline/types"
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
import { TimeLocationBox } from "../../components/TimeLocationBox/TimeLocationBox"

const createOrganizerPageUrl = (item: Group | Company) => {
  if ("type" in item) {
    return createGroupPageUrl(item)
  }

  return `/bedrifter/${item.slug}`
}

const mapToImageAndName = (item: Group | Company) => (
  <Link
    href={createOrganizerPageUrl(item)}
    key={item.name}
    className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-stone-700 dark:hover:bg-stone-800"
  >
    {item.imageUrl && (
      <GroupLogo
        src={item.imageUrl}
        alt={"abbreviation" in item ? item.abbreviation : item.name}
        width={22}
        height={22}
        containerClassName="rounded-sm p-0.5 size-5.5"
      />
    )}
    <Text>{"abbreviation" in item ? item.abbreviation : item.name}</Text>
  </Link>
)

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

  const futureChildEventWithAttendances = childEventWithAttendance.filter(({ event }) => !isPast(event.end))
  const pastChildEventsWithAttendances = childEventWithAttendance.filter(({ event }) => isPast(event.end))

  return (
    <div className="flex flex-col gap-8">
      <EventHeader event={event} showDashboardLink={isOrganizer || isAdmin} />

      {childEventWithAttendance.length > 0 ? (
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
  const hostingGroups = event.hostingGroups.map((group) => mapToImageAndName(group))
  const companyList = event.companies.map((company) => mapToImageAndName(company))
  const organizers = [...companyList, ...hostingGroups]

  return (
    <div className="flex w-full flex-col gap-8 md:flex-row text-base">
      <div className="w-full flex flex-col gap-4 md:w-[60%]">
        {parentEvent && (
          <div className="flex flex-col gap-1 p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-0 dark:bg-stone-800">
            <Title element="h4" size="sm" className="text-base">
              Arrangementet er en del av
            </Title>
            <EventListItem event={parentEvent} attendance={parentAttendance} userId={user?.id ?? null} />
          </div>
        )}

        {organizers.length > 0 ? (
          <div className="flex flex-row gap-2">{organizers}</div>
        ) : (
          <Text className="text-gray-900 dark:text-stone-400">Ingen arrangører</Text>
        )}

        {event.description && <EventDescription description={event.description} />}
      </div>

      <div className="flex flex-1 flex-col gap-8 sm:gap-4 md:min-w-88 lg:min-w-104">
        <div className="sm:hidden h-1 rounded-full w-full bg-gray-200 dark:bg-stone-700" />
        <TimeLocationBox event={event} />
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
