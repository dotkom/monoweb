import { ComingEvent } from "@/components/molecules/ComingEvent/ComingEvent"
import CompanySplash from "@/components/organisms/CompanySplash/CompanySplash"
import EventSplash from "@/components/organisms/EventSplash/EventSplash"
import { getServerClient } from "@/utils/trpc/serverClient"
import { Button } from "@dotkomonline/ui"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"

export default async function App() {
  const serverClient = await getServerClient()
  const events = await serverClient.event.recommended({ limit: 7 })
  const session = await getServerSession(authOptions)
  const isLoggedIn = session !== null;

  const mainEvent = isLoggedIn ? events.shift() : null;

  return (
    <div className="mt-8">
      {mainEvent ?
        <div className="grid grid-cols-8 gap-4 h-full w-full">
          <div className="col-span-5">
            <EventSplash event={mainEvent} />
          </div>
          <div className="col-span-3 bg-green w-full h-full">
          </div>
        </div>
        :
        <CompanySplash className="hidden md:flex" />
      }

      <div className="flex scroll-m-20 justify-between border-b border-b-slate-7 pb-1 tracking-tight transition-colors">
        <Link href="/events" className="hidden text-3xl font-semibold hover:underline sm:block">
          Arrangementer
        </Link>
        <Link href="/events" className="hidden sm:block">
          <Button>Flere arrangementer</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {events.map((event) => <ComingEvent event={event}/>)}
      </div>
      <div className="h-screen" />
    </div>
  )
}
