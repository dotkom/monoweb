"use client"

import { filterJobListings, sortDates } from "@/app/karriere/filter-functions"
import {
  CompanyFiltersContainer,
  type SortOption,
  translationJobTypes,
} from "@/components/molecules/CompanyFiltersContainer/CompanyFiltersContainer"
import { useTRPC } from "@/utils/trpc/client"
import type { JobListing, JobListingEmployment } from "@dotkomonline/types"
import { Badge, Icon, Text } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { type FC, useMemo, useState } from "react"

export interface EmploymentCheckbox {
  name: JobListingEmployment
  checked: boolean
}

const getLocations = (jobListings: JobListing[]) => {
  const locations = new Set<string>()
  for (const jobListing of jobListings) {
    for (const location of jobListing.locations) {
      locations.add(location.name)
    }
  }

  return Array.from(locations)
}

export const CareerPage = () => {
  const trpc = useTRPC()
  const { data: jobListings, isLoading } = useQuery(trpc.jobListing.all.queryOptions())

  const [chosenLocation, setChosenLocation] = useState<string>("Alle")
  const [searchName, setSearchName] = useState<string>("")
  const [chosenEmployments, setChosenEmployments] = useState<EmploymentCheckbox[]>([
    { name: "PARTTIME", checked: false },
    { name: "FULLTIME", checked: false },
    { name: "SUMMER_INTERNSHIP", checked: false },
    { name: "OTHER", checked: false },
  ])
  const [chosenSort, setChosenSort] = useState<SortOption>("Frist")

  const filteredJobListings = useMemo(() => {
    if (!jobListings) {
      return []
    }

    return jobListings
      .filter((jobListing) => filterJobListings(jobListing, chosenLocation, chosenEmployments, searchName, chosenSort))
      .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2, chosenSort))
      .sort((jobListing1, jobListing2) => {
        if (jobListing1.featured && !jobListing2.featured) return -1
        if (!jobListing1.featured && jobListing2.featured) return 1
        return 0
      })
  }, [jobListings, chosenLocation, chosenEmployments, searchName, chosenSort])

  return (
    <div>
      <div className="border-gray-600 left-0 z-0 w-full border-b">
        <div className="flex flex-row gap-96">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-bold border-b-0">Karrieremuligheter</p>
            <p className="text-gray-800">Ser du etter en jobb? Ta en titt på disse karrieremulighetene</p>
          </div>
        </div>
      </div>
      {isLoading || !jobListings ? (
        <Text>Laster...</Text>
      ) : (
        <div className="mb-10 mt-10 flex flex-col xl:flex-row gap-x-12">
          <CompanyFiltersContainer
            chosenLocation={chosenLocation}
            setChosenLocation={setChosenLocation}
            searchName={searchName}
            setSearchName={setSearchName}
            chosenEmployments={chosenEmployments}
            setChosenEmployments={setChosenEmployments}
            chosenSort={chosenSort}
            setChosenSort={setChosenSort}
            places={getLocations(jobListings)}
          />
          <div className="flex-1">
            <div className="flex flex-col gap-6">
              {filteredJobListings.map((c) => (
                <div key={c.id}>
                  <CompanyAdListItem jobListing={c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
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

export type CompanyAdListItemProps = {
  jobListing: JobListing
}

export const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ jobListing }: CompanyAdListItemProps) => {
  const color =
    jobListing.employment === "SUMMER_INTERNSHIP" ? "amber" : jobListing.employment === "FULLTIME" ? "red" : "blue"

  return (
    <Link
      href={`/karriere/${jobListing.id}`}
      className="border-gray-200 flex h-56 items-center justify-between rounded-lg border px-6 py-2"
    >
      <div className="flex flex-row items-center gap-8 w-full">
        {jobListing.company.imageUrl && (
          <Image
            src={jobListing.company.imageUrl}
            width={140}
            height={80}
            alt={`${jobListing.company.name}'s job posting`}
            className="hidden md:block rounded-sm"
          />
        )}
        <div className="flex flex-col w-full">
          <h3 className="text-lg md:text-xl xl:text-2xl">{jobListing.title}</h3>
          <p className="text-gray-700 my-2">{jobListing.company.name}</p>
          <div className="flex flex-row justify-between w-full">
            <div>
              <div className="flex flex-row gap-1">
                <Icon width={16} icon={"tabler:map-pin"} />
                {showLocations(jobListing.locations.map((location) => location.name))}
              </div>
              <div className="flex flex-row gap-1">
                <Icon width={16} icon={"tabler:clock-hour-3"} />
                {formatDistanceToNowStrict(jobListing.createdAt)}
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

export default CareerPage
