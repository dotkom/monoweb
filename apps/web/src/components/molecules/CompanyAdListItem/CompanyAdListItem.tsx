import type { JobListing } from "@dotkomonline/types"
import { Badge, Icon } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
interface CompanyAdListItemProps {
  career: JobListing
}
function timeSinceCreated(date: Date) {
  if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)) < 1) {
    return "nylig lagt til"
  }
  if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)) < 24) {
    const timer = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    return `${timer} timer gammel`
  }
  if ((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000) < 7) {
    const dager = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    return `${dager} dager gammel`
  }
  if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)) < 52) {
    const uker = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 7))
    return `${uker} uker gammel`
  }
}
function showLocations(locations: string[]) {
  if (locations.length === 0) {
    return <p>Ikke definert</p>
  }
  return (
    <div className="flex flex-row gap-1">
      {locations.map((location) => (
        <p key={location}>{location}</p>
      ))}
    </div>
  )
}
const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ career }: CompanyAdListItemProps) => {
  const color =
    career.employment === "Sommerjobb/internship" ? "amber" : career.employment === "Fulltid" ? "red" : "blue"
  const deadline = career.deadline ? format(career.deadline, "dd.MM.yyyy") : "Ingen frist"

  return (
    <Link
      href={`/career/${career.id}`}
      className="border-slate-3 flex h-[130px] items-center justify-between rounded-lg border px-6 py-2"
    >
      <div className="flex flex-row items-center gap-8">
        <Image src={career.company.image || ""} width={140} height={80} alt={`${career.company.name}’s job posting`} />
        <div>
          <h3 className="mt-2">{career.company.name}</h3>
          <p className="text-slate-8">{career.employment}</p>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row gap-1">
              <Icon width={16} icon={"tabler:map-pin"} />
              {showLocations(career.locations)}
            </div>
            <div className="flex flex-row gap-1">
              <Icon width={16} icon={"tabler:clock-hour-3"} />
              {timeSinceCreated(career.createdAt)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className=" text-right">
          <Badge color={color} variant="light">
            {career.employment}
          </Badge>
        </div>
        <div className="flex flex-row gap-1 text-right">
          <Icon width={16} icon={"tabler:calendar-down"} />
          <p>
            <b>Frist: </b>
            {career.deadline == null
              ? "Ingen Frist"
              : career.deadline.toLocaleString("no-NO", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
    </Link>
  )
}
export default CompanyAdListItem
