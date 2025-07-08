import EventImagePlaceholder from "@/assets/EventImagePlaceholder.svg"
import { auth } from "@/auth"
import { ArticleListItem } from "@/components/molecules/ArticleListItem"
import { CompanySplash } from "@/components/molecules/CompanySplash/CompanySplash"
import { AttendanceStatus } from "@/components/molecules/EventCard/AttendanceStatus"
import { DateAndTime } from "@/components/molecules/EventCard/DateAndTime"
import { OfflineCard } from "@/components/molecules/OfflineCard"
import { server } from "@/utils/trpc/server"
import type { AttendanceId, EventDetail } from "@dotkomonline/types"
import { Button, Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export default async function App() {
  const events = await server.event.all.query({ page: { take: 3 } })
  const featuredArticles = await server.article.featured.query()
  const offlines = await server.offline.all.query()

  const attendanceIds = events.map((event) => event.attendance?.id).filter(Boolean) as AttendanceId[]

  const session = await auth.getServerSession()
  const user = session ? await server.user.getMe.query() : undefined

  const attendanceStatuses = user
    ? await server.attendance.getAttendeeStatuses.query({
        userId: user.id,
        attendanceIds,
      })
    : null

  return (
    <section className="flex flex-col gap-12 w-full">
      <CompanySplash />

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        <div className="grid grid-cols-5 gap-4">
          {events.map((eventDetail) => {
            const attendeeStatus = attendanceStatuses?.get(eventDetail.attendance?.id ?? "") ?? null

            return <EventCard key={eventDetail.event.id} eventDetail={eventDetail} attendeeStatus={attendeeStatus} />
          })}

          <Tilt className="flex-grow" tiltMaxAngleX={2} tiltMaxAngleY={2} scale={1.05}>
            <Button
              element="a"
              href="/arrangementer"
              className="w-full h-full bg-blue-3 hover:bg-blue-4 text-brand-9 hover:text-brand-12"
              iconRight={<Icon icon="tabler:arrow-up-right" />}
            >
              <Text>Se alle arrangementer</Text>
            </Button>
          </Tilt>
        </div>
      </div>

      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors mt-16">
        <Link href="/artikler" className="text-3xl font-semibold hover:underline">
          Artikler
        </Link>
        <Link href="/artikler" className="hidden sm:block">
          <Button>Flere artikler</Button>
        </Link>
      </div>
      <div className="grid gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {featuredArticles.slice(0, 6).map((article) => (
          <ArticleListItem article={article} orientation="vertical" key={article.id} />
        ))}
      </div>

      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors mt-16">
        <Link href="/offline" className="text-3xl font-semibold hover:underline">
          Offline
        </Link>
        <Link href="/offline" className="hidden sm:block">
          <Button>Flere Offline</Button>
        </Link>
      </div>
      <div className="grid gap-8 mt-2 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {offlines.slice(0, 5).map((offline) => (
          <OfflineCard offline={offline} key={offline.id} />
        ))}
      </div>
    </section>
  )
}

interface ComingEventProps {
  eventDetail: EventDetail
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
}

export const EventCard: FC<ComingEventProps> = ({
  eventDetail: {
    event: { id, imageUrl, title, start, end },
    attendance,
  },
  attendeeStatus,
}) => {
  return (
    <Link href={`/arrangementer/${slugify(title)}/${id}`} className="flex flex-col gap-2">
      <Tilt>
        <Image
          width={200}
          height={150}
          src={imageUrl ? imageUrl : EventImagePlaceholder}
          alt={title}
          className="rounded-lg border border-slate-3 object-cover aspect-[4/3]"
        />
      </Tilt>
      <div className="flex flex-col gap-1">
        <Title element="p" size="sm" className="font-normal">
          {title}
        </Title>

        <div className="flex flex-row gap-4 items-center">
          <DateAndTime start={start} end={end} />
          {attendance && (
            <AttendanceStatus attendance={attendance} attendeeStatus={attendeeStatus} startInPast={isPast(start)} />
          )}
        </div>
      </div>
    </Link>
  )
}
