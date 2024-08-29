import type { Committee, Company, Event } from "@dotkomonline/types"
import { Badge } from "@dotkomonline/ui"
import { DEFAULT_DAYS_RELATIVE_THRESHOLD, DEFAULT_LOCALE, daysBetweenNow, formatList } from "@dotkomonline/utils"
import Image from "next/image"
import type { FC } from "react"

interface Props {
  event: Event
  committees: Committee[]
  companies: Company[]
}

const listFormat = new Intl.ListFormat(DEFAULT_LOCALE, { type: "conjunction" })

const mapToImageAndName = (item: Committee | Company) => (
  <div key={item.name} className="flex flex-row gap-2 items-center px-3 py-2 rounded-md hover:bg-slate-3">
    {item.image && <Image src={item.image} alt={item.name} width={22} height={22} />}
    <p>{item.name}</p>
  </div>
)

export const EventInfoBox: FC<Props> = ({ event, committees, companies }) => {
  const committeeList = committees.map(mapToImageAndName)
  const companyList = companies.map(mapToImageAndName)
  const committeeAndCompanyList = [...committeeList, ...companyList]

  // TODO - implement event organizers
  const eventOrganizers = ["Ola", "Kari", "Sivert"]

  return (
    <section className="mr-10 w-full flex flex-col space-y-4 md:w-[60%]">
      <section className="flex flex-row space-x-6 items-center">
        {committeeAndCompanyList.length ? (
          <div className="flex flex-row space-x-2">{committeeAndCompanyList}</div>
        ) : null}
        <div className="flex flex-row space-x-4 text-slate-9">
          <span>Organisert av {formatList(eventOrganizers, { length: 2, give: 1 })}</span>
        </div>
        {DEFAULT_DAYS_RELATIVE_THRESHOLD < Math.abs(daysBetweenNow(event.start)) && (
          <Badge color={"slate"} variant={"outline"} className="text-sm px-3 py-1 text-slate-9">
            Nylig publisert
          </Badge>
        )}
      </section>
      <div className="bg-slate-2 p-5 text-[18px] rounded-2xl">
        <p>{event.description}</p>
      </div>
    </section>
  )
}
