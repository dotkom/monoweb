"use client"

import type { JobListing } from "@dotkomonline/types"
import { RichText } from "@dotkomonline/ui"
import { Button, Icon } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

interface JobListingViewProps {
  jobListing: JobListing
}

export const JobListingView: FC<JobListingViewProps> = ({ jobListing }: JobListingViewProps) => {
  const {
    title,
    applicationEmail,
    applicationLink,
    company,
    createdAt,
    deadlineAsap,
    description,
    employment,
    end,
    featured,
    id,
    about,
    locations,
    start,
    deadline,
  } = jobListing

  return (
    <div className="mx-auto mt-10 flex w-10/12 justify-between">
      <div className="w-1/3">
        <div className="relative pb-10">
          {company.imageUrl && (
            <Image src={company.imageUrl} width={4000} height={250} alt="company_image" className="rounded-lg" />
          )}
        </div>

        <p>{about}</p>

        <div className="bg-black mx-auto mb-14 mt-10 h-[0.5px] w-full" />
        <Link href="/karriere">
          <div className="flex items-center">
            <Icon icon="mdi:arrow-left" className="text-blue-800" width={20} height={20} />
            <p className="m-0 border-0 pl-2 text-base text-blue-500"> ANDRE MULIGHETER</p>
          </div>
        </Link>
        <div className="bg-gray-800 mb-7 mt-3 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <Icon icon="mdi:globe" className="text-blue-800" width={20} height={20} />
          <p className="m-0 pl-2">{locations.map((location) => location.name)}</p>
        </div>
        <div className="bg-gray-800 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-800 mb-[-3px] inline">
            <Icon icon="mdi:clock-outline" className="text-blue-800" width={20} height={20} />
          </div>
          {deadline ? <p className="m-0 pl-2">{formatDate(deadline)}</p> : <p className="m-0 pl-2">Ingen frist</p>}
        </div>
        <div className="bg-gray-800 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-800 mb-[-3px] inline">
            <Icon icon="mdi:briefcase-outline" className="text-blue-800" width={20} height={20} />
          </div>
          <p className="m-0 pl-2">{employment}</p>
        </div>
        <div className="bg-gray-800 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-800 mb-[-3px] inline">
            <Icon icon="mdi:content-copy" className="text-blue-800" width={20} height={20} />
          </div>
          <p className="m-0 pl-2">{employment}</p>
        </div>
        <div className="bg-gray-800 mb-3 mt-7 h-[0.5px] w-full" />
        {applicationLink ? (
          <Link href={applicationLink}>
            <Button className="bg-blue-700 mt-3 w-20 mb-20">Søk</Button>
          </Link>
        ) : (
          <div>ingen link</div>
        )}
      </div>
      <div className="w-2/3">
        <div className="border-amber-800 ml-[38px] mt-2 border-l-[1px] pl-4 mb-10">
          <p className="m-0 text-4xl font-bold">{company.name}</p>
          <p className="m-0 text-3xl">{title}</p>
        </div>
        <div
          className="[&_[dir='ltr']]:text-white
                      [&_[dir='ltr']]:border-amber-800
                        [&_[dir='ltr']]:border-l-[1px]
                        [&_[dir='ltr']]:pl-4
                        mb-12 ml-8 flex flex-col"
        >
          <RichText content={description} />
        </div>
      </div>
    </div>
  )
}
