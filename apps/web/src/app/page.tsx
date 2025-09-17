import { auth } from "@/auth"
import { OnlineHero } from "@/components/molecules/OnlineHero/OnlineHero"
import { server } from "@/utils/trpc/server"
import type { Attendance, Event } from "@dotkomonline/types"
import { RichText } from "@dotkomonline/ui"
import { Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { formatDate } from "date-fns"
import { cookies as getCookies } from "next/headers"
import Link from "next/link"
import type { FC } from "react"
import { ConstructionNotice } from "./construction-notice"

export default async function App() {
  const [session, isStaff] = await Promise.all([auth.getServerSession(), server.user.isStaff.query()])

  const { items } = await server.event.all.query({
    take: 3,
    filter: {
      byEndDate: {
        max: null,
        min: getCurrentUTC(),
      },
      excludingOrganizingGroup: ["velkom"],
      excludingType: isStaff ? [] : undefined,
      orderBy: "asc",
    },
  })

  const cookies = await getCookies()
  const constructionNoticeShown = cookies.get("hide-construction-notice")?.value !== "1"

  return (
    <section className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-4">
        {constructionNoticeShown && <ConstructionNotice />}
        <OnlineHero />
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-3xl font-semibold">Arrangementer</Title>

        <div className="flex flex-col md:grid md:grid-cols-3 md:[grid-template-rows:4fr_4fr_2fr] gap-6 w-full">
          <Link
            href={`/arrangementer/${slugify(items[0].event.title)}/${items[0].event.id}`}
            className="col-span-2 row-span-3 flex flex-col w-full gap-5 p-3 border border-gray-200 rounded-3xl transition-colors hover:bg-gray-50 dark:hover:bg-stone-700"
          >
            <Tilt tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} scale={1.005}>
              <img
                src={items[0].event.imageUrl ? items[0].event.imageUrl : "/placeholder.svg"}
                alt={items[0].event.title}
                className="rounded-xl border border-gray-200 object-cover aspect-[16/9]"
              />
            </Tilt>
            <div className="flex flex-col gap-3">
              <Title element="p" size="xl" className="text-xl max-md:font-medium md:text-4xl">
                {items[0].event.title}
              </Title>

              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <Icon icon="tabler:calendar-event" className="text-xl text-gray-800 dark:text-stone-400" />
                  <Text className="text-lg">{formatDate(items[0].event.start, "dd.MM")}</Text>
                </div>
                <div className="max-md:hidden">
                  <RichText content={items[0].event.description} lineClamp="line-clamp-6" hideToggleButton />
                </div>
              </div>
            </div>
          </Link>
          {items.slice(1).map(({ event, attendance }) => {
            const reservedStatus =
              attendance?.attendees.find((attendee) => attendee.user.id === session?.sub)?.reserved ?? null

            return <EventCard key={event.id} event={event} attendance={attendance} reservedStatus={reservedStatus} />
          })}
          <Tilt>
            <Button
              element={Link}
              href="/arrangementer"
              className="rounded-3xl w-full h-full bg-blue-200 text-brand-800 hover:text-black"
              iconRight={<Icon icon="tabler:arrow-up-right" />}
            >
              <Text>Se alle arrangementer</Text>
            </Button>
          </Tilt>
        </div>
      </div>
    </section>
  )
}

interface ComingEventProps {
  event: Event
  attendance: Attendance | null
  reservedStatus: boolean | null
}

const EventCard: FC<ComingEventProps> = ({ event, attendance, reservedStatus }) => {
  return (
    <Link
      href={`/arrangementer/${slugify(event.title)}/${event.id}`}
      className="flex flex-col h-full gap-3 p-3 border border-gray-200 rounded-3xl transition-colors hover:bg-gray-50 dark:hover:bg-stone-700"
    >
      <Tilt>
        <img
          src={event.imageUrl ? event.imageUrl : "/placeholder.svg"}
          alt={event.title}
          className="rounded-xl border border-gray-200 object-cover aspect-[16/9] w-[40rem]"
        />
      </Tilt>
      <div className="flex flex-col gap-2 w-full">
        <Title element="p" size="md" className="font-normal line-clamp-2">
          {event.title}
        </Title>

        <div className="flex flex-row gap-2 items-center">
          <Icon icon="tabler:calendar-event" className="text-base text-gray-800 dark:text-stone-400" />
          <Text className="text-sm">{formatDate(event.start, "dd.MM")}</Text>
        </div>
      </div>
    </Link>
  )
}

// {event.imageUrl ? event.imageUrl : "/placeholder.svg"}

//  <div className="flex flex-col md:flex-row gap-5">
//             <Link
//               href={`/arrangementer/${slugify(items[0].event.title)}/${items[0].event.id}`}
//               className="flex flex-col w-full gap-5 p-5 border border-gray-200 rounded-3xl transition-colors hover:bg-gray-50 dark:hover:bg-stone-700"
//             >
//               <Tilt>
//                 <img
//                   src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*"
//                   alt={items[0].event.title}
//                   className="rounded-xl border border-gray-200 object-cover aspect-[4/3]"
//                 />
//               </Tilt>
//               <div className="flex flex-col gap-3">
//                 <Title element="p" size="xl" className="font-normal">
//                   {items[0].event.title}
//                 </Title>

//                 <div className="flex flex-row gap-4 items-center">
//                   <div className="flex flex-row gap-2 items-center">
//                     <Icon icon="tabler:calendar-event" className="text-xl text-gray-800 dark:text-stone-400" />
//                     <Text className="text-lg">{formatDate(items[0].event.start, "dd.MM")}</Text>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           <div className="grid grid-cols-1 gap-5">
//             {items.slice(1).map(({ event, attendance }) => {
//               const reservedStatus =
//                 attendance?.attendees.find((attendee) => attendee.user.id === session?.sub)?.reserved ?? null

//               return <EventCard key={event.id} event={event} attendance={attendance} reservedStatus={reservedStatus} />
//             })}
//           </div>
//         </div>
