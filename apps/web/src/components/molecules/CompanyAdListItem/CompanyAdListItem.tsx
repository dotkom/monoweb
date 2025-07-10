import type { JobListing } from "@dotkomonline/types"
import { Badge, Icon } from "@dotkomonline/ui"
import { formatRelativeTime } from "@dotkomonline/utils"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
import { translationJobTypes } from "../CompanyFiltersContainer/CompanyFiltersContainer"

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

export type CompanyAdListItemProps = {
  jobListing: JobListing
}

export const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ jobListing }: CompanyAdListItemProps) => {
  const color =
    jobListing.employment === "SUMMER_INTERNSHIP" ? "amber" : jobListing.employment === "FULLTIME" ? "red" : "blue"

  return (
    <Link
      href={`/karriere/${jobListing.id}`}
      className="border-slate-3 flex h-56 items-center justify-between rounded-lg border px-6 py-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex flex-row items-center gap-8 w-full">
        {jobListing.company.image && (
          <Image
            src={jobListing.company.image}
            width={140}
            height={80}
            alt={`${jobListing.company.name}’s job posting`}
            className="hidden md:block rounded-sm"
          />
        )}
        <div className="flex flex-col w-full">
          <h3 className="text-lg md:text-xl xl:text-2xl">{jobListing.title}</h3>
          <p className="text-slate-8 my-2">{jobListing.company.name}</p>
          <div className="flex flex-row justify-between w-full">
            <div>
              <div className="flex flex-row gap-1">
                <Icon width={16} icon={"tabler:map-pin"} />
                {showLocations(jobListing.locations.map((location) => location.name))}
              </div>
              <div className="flex flex-row gap-1">
                <Icon width={16} icon={"tabler:clock-hour-3"} />
                {formatRelativeTime(jobListing.createdAt)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-right">
                <Badge color={color} variant="light">
                  {translationJobTypes[jobListing.employment]}
                </Badge>
              </div>
              <div className="flex flex-row text-right">
                <Icon width={16} icon={"tabler:calendar-down"} className="mr-1" />
                <p>
                  <b>Frist: </b>
                  {jobListing.deadline == null
                    ? "Ingen Frist"
                    : jobListing.deadline.toLocaleString("no-NO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
