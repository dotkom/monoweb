import { EventCard } from "@/components/molecules/ComingEvent/ComingEvent"
import CompanySplash from "@/components/molecules/CompanySplash/CompanySplash"
import { server } from "@/utils/trpc/server"
import { Button } from "@dotkomonline/ui"
import Link from "next/link"

export default async function App() {
  const events = await server.event.all.query()

  return (
    <section className="w-full">
      <CompanySplash />
      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors">
        <Link href="/events" className="hidden text-3xl font-semibold hover:underline sm:block">
          Arrangementer
        </Link>
        <Link href="/events" className="hidden sm:block">
          <Button>Flere arrangementer</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {events.map((eventDetail) => (
          <EventCard eventDetail={eventDetail} key={eventDetail.event.id} />
        ))}
      </div>
    </section>
  )
}
