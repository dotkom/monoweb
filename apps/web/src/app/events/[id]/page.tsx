import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import type { Company, InterestGroup } from "@dotkomonline/types"
import type { Group } from "@dotkomonline/types"
import Image from "next/image"
import Link from "next/link"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"
import { EventDescriptionAndByline } from "@/components/views/EventView"

const mapToImageAndName = (item: Group | Company | InterestGroup) => (
  // TODO: Href link to all events by committee or company
  <Link href="/" key={item.name} className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg hover:bg-slate-2">
    {item.image && <Image src={item.image} alt={item.name} width={22} height={22} />}
    <p>{item.name}</p>
  </Link>
)

const EventDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await auth.getServerSession()
  const eventDetail = await server.event.getAttendanceEventDetail.query(id)

  const hostingGroups = eventDetail.eventHostingGroups.map(mapToImageAndName)
  const hostingInterestGroups = eventDetail.eventInterestGroups.map(mapToImageAndName)
  const companyList = eventDetail.companies.map(mapToImageAndName)
  const organizers = [...companyList, ...hostingGroups, ...hostingInterestGroups]

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <section className="mr-10 w-full flex flex-col space-y-4 md:w-[60%]">
          {organizers.length && <div className="flex flex-row space-x-1">{organizers}</div>}
          <EventDescriptionAndByline
            event={eventDetail.event}
            groups={eventDetail.eventHostingGroups}
            interestGroups={eventDetail.eventInterestGroups}
            companies={eventDetail.companies}
          />
        </section>
        <div className="flex-1 flex-col">
          {eventDetail.attendance !== null && <AttendanceCard session={session} initialEventDetail={eventDetail} />}
          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
