import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { server } from "@/utils/trpc/server"
import type { Committee, Company } from "@dotkomonline/types"
import { getServerSession } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

const mapToImageAndName = (item: Committee | Company) => (
  // TODO: Href link to all events by committee or company
  <Link href="/" key={item.name} className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg hover:bg-slate-2">
    {item.image && <Image src={item.image} alt={item.name} width={22} height={22} />}
    <p>{item.name}</p>
  </Link>
)

const EventDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const eventDetail = await server.event.getWebEventDetailData.query(id)

  const committeeList = eventDetail.eventCommittees.map(mapToImageAndName)
  const companyList = eventDetail.eventCompanies.map(mapToImageAndName)
  const committeeAndCompanyList = [...committeeList, ...companyList]

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <section className="mr-10 w-full flex flex-col space-y-4 md:w-[60%]">
          {committeeAndCompanyList.length && <div className="flex flex-row space-x-1">{committeeAndCompanyList}</div>}
          <div className="bg-slate-2 p-5 text-[18px] rounded-2xl">
            <p>{eventDetail.event.description}</p>
          </div>
        </section>
        <div className="flex-1 flex-col">
          {eventDetail.hasAttendance && <AttendanceCard sessionUser={session?.user} initialEventDetail={eventDetail} />}
          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
