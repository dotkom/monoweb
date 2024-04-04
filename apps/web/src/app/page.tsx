import { getServerClient } from "@/utils/trpc/serverClient"
import { getServerSession } from "next-auth"
import { Button } from "../../../../packages/ui"
import CompanySplash from "@/components/molecules/CompanySplash/CompanySplash"
import { ComingEvent } from "@/components/molecules/ComingEvent/ComingEvent"
import Link from "next/link"

export default async function App() {
  const serverClient = await getServerClient()
  const session = await getServerSession()
  const events = await serverClient.event.recommended()

  return (
    <div className="mt-8">
      <CompanySplash className="hidden md:flex" />

      <div className="flex scroll-m-20 justify-between border-b border-b-slate-7 pb-1 tracking-tight transition-colors">
        <Link href="/events" className="hidden text-3xl font-semibold hover:underline sm:block">
          Arrangementer
        </Link>
        <Link href="/events" className="hidden sm:block">
          <Button>Flere arrangementer</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {events.map((event) => (
          <ComingEvent
            title={event.title}
            img={event.imageUrl ?? ""}
            tag={event.type}
            max_attending={10}
            attending={5}
            date={event.start.toString()}
            info_link={`/events/${event.id}`}
            key={event.id}
          />
        ))}
      </div>
      <div className="h-screen" />
    </div>
  )
}
