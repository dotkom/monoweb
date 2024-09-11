import type { Committee, Company, Event } from "@dotkomonline/types"
import Image from "next/image"
import type { FC } from "react"

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

export const EventDescriptionAndByline: FC<Props> = ({ event, committees, companies }) => {
  const committeeList = committees.map(mapToImageAndName)
  const companyList = companies.map(mapToImageAndName)

  return (
    <div className="mr-10 w-full flex flex-col gap-8 md:w-[60%]">
      <div className="flex flex-row gap-8">{[...committeeList, ...companyList]}</div>
      <p className="bg-slate-2 p-5 text-[18px] rounded-2xl">{event.description}</p>
    </div>
  )
}

export const SkeletonEventDescriptionAndByline = () => (
    <div className="mr-10 w-full flex flex-col gap-8 md:w-[60%]">
    </div>
)
