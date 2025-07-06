import { auth } from "@/auth"
import { ArticleListItem } from "@/components/molecules/ArticleListItem"
import { EventCard } from "@/components/molecules/ComingEvent/ComingEvent"
import { CompanySplash } from "@/components/molecules/CompanySplash/CompanySplash"
import { OfflineCard } from "@/components/molecules/OfflineCard"
import { server } from "@/utils/trpc/server"
import type { AttendanceId } from "@dotkomonline/types"
import { Button, Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import Link from "next/link"

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

        <div className="flex flex-row gap-8">
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
          <ArticleListItem article={article} key={article.id} orientation="vertical" />
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
