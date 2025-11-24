import { auth } from "@/auth"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { server } from "@/utils/trpc/server"
import {
  type Attendance,
  type Company,
  type Event,
  type Group,
  type GroupType,
  type Punishment,
  type User,
  createGroupPageUrl,
} from "@dotkomonline/types"
import { Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import { createEventPageUrl, createEventSlug } from "@dotkomonline/utils"
import clsx from "clsx"
import { isPast } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { RedirectType, notFound, permanentRedirect } from "next/navigation"
import { AttendanceCard } from "../../components/AttendanceCard/AttendanceCard"
import { EventDescription } from "../../components/EventDescription"
import { EventHeader } from "../../components/EventHeader"
import { EventList } from "../../components/EventList"
import { TimeLocationBox } from "../../components/TimeLocationBox/TimeLocationBox"

type OrganizerType = GroupType | "COMPANY"

const createOrganizerPageUrl = (item: Group | Company) => {
  if ("type" in item) {
    return createGroupPageUrl(item)
  }

  return `/bedrifter/${item.slug}`
}

const mapToImageAndName = (item: Group | Company, type: OrganizerType) => (
  <Link
    href={createOrganizerPageUrl(item)}
    key={item.name}
    className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-stone-700 dark:hover:bg-stone-800"
  >
    {item.imageUrl && (
      <Image
        src={item.imageUrl}
        // TODO: Reconsider life once more
        alt={"abbreviation" in item ? item.abbreviation : item.name}
        width={22}
        height={22}
        className={clsx((type === "COMMITTEE" || type === "NODE_COMMITTEE") && "dark:invert")}
      />
    )}
    <Text>{"abbreviation" in item ? item.abbreviation : item.name}</Text>
  </Link>
)

const EventWithAttendancePage = async ({ params }: { params: Promise<{ slug: string; eventId: string }> }) => {
  const { slug, eventId } = await params
  const decodedSlug = decodeURIComponent(slug)

  const session = await auth.getServerSession()

  const eventDetail = await server.event.find.query(eventId)

  if (!eventDetail) {
    notFound()
  }

  const { event, attendance } = eventDetail

  if (decodedSlug !== createEventSlug(event.title)) {
    permanentRedirect(createEventPageUrl(eventId, event.title), RedirectType.replace)
  }

  const [user, childEventWithAttendance, parentEventWithAttendance] = await Promise.all([
    session ? server.user.getMe.query() : null,
    server.event.findChildEvents.query({ eventId }),
    server.event.findParentEvent.query({ eventId }),
  ])

  const isOrganizer = user ? await server.event.isOrganizer.query({ eventId }) : null
  const punishment = attendance && user && (await server.personalMark.getExpiryDateForUser.query({ userId: user.id }))

  const parentEvent = parentEventWithAttendance?.event ?? null
  const parentAttendance = parentEventWithAttendance?.attendance ?? null

  const futureChildEventWithAttendances = childEventWithAttendance.filter(({ event }) => !isPast(event.end))
  const pastChildEventsWithAttendances = childEventWithAttendance.filter(({ event }) => isPast(event.end))

  return (
    <div className="flex flex-col gap-8">
      <EventHeader event={event} showDashboardLink={isOrganizer ?? false} />

      {childEventWithAttendance.length > 0 ? (
        <Tabs defaultValue="description">
          <TabsList className="w-full sm:w-fit">
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
              punishment={punishment}
              user={user}
            />
          </TabsContent>

          <TabsContent value="child-events" className="p-0 border-none mt-4">
            <div>
              <EventList
                futureEventWithAttendances={futureChildEventWithAttendances}
                pastEventWithAttendances={pastChildEventsWithAttendances}
                alwaysShowChildEvents
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
          punishment={punishment}
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
  punishment: Punishment | null
  user: User | null
}

const EventContent = ({ event, attendance, parentEvent, parentAttendance, punishment, user }: EventContentProps) => {
  const hostingGroups = event.hostingGroups.map((group) => mapToImageAndName(group, group.type))
  const companyList = event.companies.map((company) => mapToImageAndName(company, "COMPANY"))
  const organizers = [...companyList, ...hostingGroups]

  return (
    <div className="flex w-full flex-col gap-8 md:flex-row">
      <div className="w-full flex flex-col gap-4 md:w-[60%]">
        {parentEvent && (
          <div className="flex flex-col gap-1 p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-0 dark:bg-stone-700">
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
              initialPunishment={punishment}
              parentEvent={parentEvent}
              parentAttendance={parentAttendance}
              user={user}
              event={event}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default EventWithAttendancePage
