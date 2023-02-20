import { trpc } from "@/utils/trpc"
import Link from "next/link"

const EventPage = () => {
  const { data: events, isLoading } = trpc.event.all.useQuery({ limit: 10 })
  if (isLoading) return <div>Loading...</div>
  return (
    <ul className="list-disc">
      {events &&
        events.map((event) => (
          <li key={event.id} className="text-blue-11">
            <Link href={`events/${event.id}`}>{event.title}</Link>
          </li>
        ))}
    </ul>
  )
}

export default EventPage
