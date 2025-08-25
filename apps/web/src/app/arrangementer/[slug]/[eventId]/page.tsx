import { auth } from "@/auth"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { getEventSlug, getEventUrl } from "@/utils/getEventUrl"
import { server } from "@/utils/trpc/server"
import type { Attendance, Company, Event, Group, GroupType, Punishment, User } from "@dotkomonline/types"
import { Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
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

const organizerTypeToLink: Record<OrganizerType, string> = {
  COMMITTEE: "/komiteer",
  INTEREST_GROUP: "/interessegrupper",
  COMPANY: "/bedrifter",
  NODE_COMMITTEE: "/nodekomiteer",
  ASSOCIATED: "/andre-grupper",
}

const mapToImageAndName = (item: Group | Company, type: OrganizerType) => (
  <Link
    href={`${organizerTypeToLink[type]}/${item.slug}`}
    key={item.name}
    className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-900"
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
  const session = await auth.getServerSession()

  const eventDetail = await server.event.find.query(eventId)

  if (!eventDetail) {
    notFound()
  }

  const { event, attendance } = eventDetail

  if (slug !== getEventSlug(event.title)) {
    permanentRedirect(getEventUrl(eventId, event.title), RedirectType.replace)
  }

  const [user, isStaff, childEventWithAttendance, parentEventWithAttendance] = await Promise.all([
    session ? server.user.getMe.query() : null,
    session ? server.user.isStaff.query() : null,
    server.event.findChildEvents.query({ eventId }),
    server.event.findParentEvent.query({ eventId }),
  ])

  const punishment = attendance && user && (await server.personalMark.getExpiryDateForUser.query({ userId: user.id }))

  const parentEvent = parentEventWithAttendance?.event ?? null
  const parentAttendance = parentEventWithAttendance?.attendance ?? null

  const futureChildEventWithAttendances = childEventWithAttendance.filter(({ event }) => !isPast(event.end))
  const pastChildEventsWithAttendances = childEventWithAttendance.filter(({ event }) => isPast(event.end))

  return (
    <div className="flex flex-col gap-8">
      <EventHeader event={event} isStaff={isStaff ?? false} />

      {childEventWithAttendance.length > 0 ? (
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Arrangement</TabsTrigger>
            <TabsTrigger value="child-events">Underarrangementer</TabsTrigger>
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
      <div className="w-full flex flex-col gap-4 px-2 md:px-0 md:w-[60%]">
        {parentEvent && (
          <div className="flex flex-col gap-1 p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-0 dark:bg-stone-900">
            <Title element="h4" size="sm" className="text-base">
              Arrangementet er en del av
            </Title>
            <EventListItem event={parentEvent} attendance={parentAttendance} userId={user?.id ?? null} />
          </div>
        )}

        {organizers.length > 0 ? (
          <div className="flex flex-row gap-2">{organizers}</div>
        ) : (
          <Text className="text-gray-900">Ingen arrangører</Text>
        )}

        {event.description && <EventDescription description={event.description} />}
      </div>

      <div className="flex flex-1 flex-col gap-8 sm:gap-4">
        {attendance !== null && (
          <>
            <div className="sm:hidden h-1 rounded-full w-full bg-gray-200" />

            <AttendanceCard
              initialAttendance={attendance}
              initialPunishment={punishment}
              parentEvent={parentEvent}
              parentAttendance={parentAttendance}
              user={user}
            />
          </>
        )}

        <div className="sm:hidden h-1 rounded-full w-full bg-gray-200" />

        <TimeLocationBox event={event} />
      </div>
    </div>
  )
}

export default EventWithAttendancePage
