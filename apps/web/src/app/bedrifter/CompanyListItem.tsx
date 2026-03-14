import type { Attendance, Company, Event, JobListing } from "@dotkomonline/types"
import { Title, cn, Text, Badge } from "@dotkomonline/ui"
import { IconBriefcase, IconMapPin } from "@tabler/icons-react"
import { createEventPageUrl } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import Image from "next/image"
import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { title } from "process"
import { DividerHorizontalIcon } from "@radix-ui/react-icons"

export interface CompanyListItemProps {
  company: Company
  hasJobListings: boolean
}

export const CompanyListItem: FC<CompanyListItemProps> = ({ company, hasJobListings }: CompanyListItemProps) => {
  return (
    <Link
      href={`/bedrifter/${company.slug}`}
      className={cn(
        "group flex flex-col sm:flex-row sm: gap-5 rounded-xl p-10 -mx-2 last:-mb-2",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors border border-gray-200 items-center"
      )}
    >
      <div className="relative w-max ">
        <div className="aspect-[16/9] w-full h-18  sm:h-28  bg-gray-100 dark:bg-stone-800 rounded-lg overflow-hidden">
          {company.imageUrl ? (
            <Image
              src={company.imageUrl}
              alt={company.name}
              fill
              className={cn("rounded-md object-cover w-full h-full")}
            />
          ) : (
            <PlaceHolderImage className={cn("rounded-md object-cover")} />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className=" hidden sm:block flex gap-1 ">
          <Title element="h2" className="font-bold border-b-0 text-lg line-clamp-1 sm:line-clamp-2 ">
            {company.name}
          </Title>
        </div>
        <div className="flex flex-row sm:flex-col gap-5">
          <div className="flex gap-1 items-center">
            <IconMapPin width={16} height={16} />
            <Text className="text-base whitespace-nowrap">{company.location}</Text>
          </div>
          {hasJobListings && (
            <div className="flex gap-1 items-center">
              <IconBriefcase width={16} height={16} />
              <Text className="text-base whitespace-nowrap ">Har ledig stilling </Text>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export const EventListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-4 w-full rounded-lg py-2">
      <div className="aspect-[16/9] h-22 sm:h-28 bg-gray-300 dark:bg-stone-600 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4 w-full">
        <div className="max-w-64 h-6 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-28 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-6 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>
      </div>
    </div>
  )
}
