import type { Committee, Company, Event } from "@dotkomonline/types"
import Image from "next/image"
import type { FC } from "react"
import { formatDate } from "@dotkomonline/utils"

interface Props {
  event: Event
  committees: Committee[]
  companies: Company[]
}

const mapToImageAndName = (item: Committee | Company) => (
  <div key={item.name} className="flex flex-row gap-2 items-center">
    {item.image && <Image src={item.image} alt={item.name} width={25} height={25} />}
    <p>{item.name}</p>
  </div>
)

export const EventInfoBox: FC<Props> = ({ event, committees, companies }) => {
  const committeeList = committees.map(mapToImageAndName)
  const companyList = companies.map(mapToImageAndName)
  // TODO - implement event organizers
  const eventOrganizers = ["Ola", "Kari"]

  const listFormat = new Intl.ListFormat("no-NB", { type: "conjunction" })

  return (
    <section className="mr-10 w-full flex flex-col space-y-8 md:w-[60%]">
      <section className="flex flex-row space-x-8">
        <div className="flex flex-row space-x-4">{[...committeeList, ...companyList]}</div>
        <div className="flex flex-row space-x-4 text-slate-9 items-center">
          <span>Lagt ut {formatDate(event.createdAt)}</span>
          <span>Organisert av {listFormat.format(eventOrganizers)}</span>
        </div>
      </section>
      <div className="bg-slate-2 p-5 text-[18px] rounded-2xl">
        <p>{event.description}</p>
      </div>
    </section>
  )
}
