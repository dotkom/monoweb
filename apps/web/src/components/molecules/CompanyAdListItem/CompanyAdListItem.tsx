import type { JobListing } from "@dotkomonline/types"
import { Badge, Icon } from "@dotkomonline/ui"
import { formatRelativeTime } from "@dotkomonline/utils"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

interface CompanyAdListItemProps {
  jobListing: JobListing
}
function showLocations(locations: string[]) {
  if (locations.length === 0) {
    return <p>Ikke oppgitt</p>
  }
  return (
    <div className="flex flex-row gap-1">
      <p>{locations.join(", ")}</p>
    </div>
  )
}
const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ jobListing }: CompanyAdListItemProps) => {
  const color =
    jobListing.employment === "Sommerjobb/internship" ? "amber" : jobListing.employment === "Fulltid" ? "red" : "blue"

  return (
    <Link
      href={`/career/${jobListing.id}`}
      className="border-slate-3 flex h-48 items-center justify-between rounded-lg border px-6 py-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex flex-row items-center gap-8">
        <Image
          src={jobListing.company.image || ""}
          width={140}
          height={80}
          alt={`${jobListing.company.name}’s job posting`}
          className="hidden md:block"
        />
        
        <div>
          <h3 className="mt-1 text-lg md:text-xl xl:text-2xl">{jobListing.title}</h3>
          <p className="text-slate-8 my-2">{jobListing.company.name}</p>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row gap-1">
              <Icon width={16} icon={"tabler:map-pin"} />
              {showLocations(jobListing.locations)}
            </div>
            <div className="flex flex-row gap-1">
              <Icon width={16} icon={"tabler:clock-hour-3"} />
              {formatRelativeTime(jobListing.createdAt)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-end h-full">
        <div className="text-right">
          <Badge color={color} variant="light">
            {jobListing.employment}
          </Badge>
        </div>
        <div className="flex flex-row gap-1 text-right mt-2">
          <Icon width={16} icon={"tabler:calendar-down"} />
          <p>
            <b>Frist: </b>
            {jobListing.deadline == null
              ? "Ingen Frist"
              : jobListing.deadline.toLocaleString("no-NO", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
    </Link>
  )
}
export default CompanyAdListItem
