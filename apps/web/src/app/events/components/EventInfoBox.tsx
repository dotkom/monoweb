import type { Committee, Company, Event } from "@dotkomonline/types"
import Image from "next/image"
import type { FC } from "react"
import { formatDate } from "../utils"

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

  const dateString = formatDate(event.createdAt, {
    absolute: {
      capitalize: true,
    },
    relative: {
      capitalize: true,
    },
  })

  const date = dateString.isRelative && dateString.inPast ? `${dateString.value} siden` : dateString.value

  return (
    <div className="mr-10 w-full flex flex-col space-y-8 md:w-[60%]">
      <div className="flex flex-row space-x-8">
        <div className="flex flex-row space-x-4">{[...committeeList, ...companyList]}</div>
        <div className="flex flex-row space-x-4 text-slate-9 items-center">
          <p>{date}</p>
          {/* TODO - implement name */}
          <p>Lagt ut av Navn</p>
        </div>
      </div>
      <p className="bg-slate-2 p-5 text-[18px] rounded-2xl">{event.description}</p>
    </div>
  )
}
