"use client"

import { EventList, EventListSkeleton } from "@/app/arrangementer/components/EventList"
import { useEventAllInfiniteQuery, useEventAllQuery } from "@/app/arrangementer/components/queries"
import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import type { Company } from "@dotkomonline/types"
import { RichText, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconMapPin, IconMail, IconPhone, IconWorld } from "@tabler/icons-react"
import { roundToNearestMinutes } from "date-fns"
import Image from "next/image"
import type { FC } from "react"

interface CompanyViewProps {
  company: Company
}

export const CompanyView: FC<CompanyViewProps> = ({ company }) => {
  const { name, description, phone, email, website, location, imageUrl } = company

  const icons = [
    { icon: IconMapPin, text: location, href: null },
    { icon: IconWorld, text: "Nettside", href: website },
    { icon: IconMail, text: email, href: `mailto:${email}` },
    { icon: IconPhone, text: phone, href: `tel:${phone}` },
  ]

  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllQuery({
    filter: { byOrganizingCompany: [company.id], byStartDate: { min: now, max: null } },
  })

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      byOrganizingCompany: [company.id],
      byEndDate: {
        max: now,
        min: null,
      },
    },
  })

  return (
    <EntryDetailLayout title={name} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-600 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {imageUrl && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <a href={website} target="_blank" rel="noreferrer">
                <Image src={imageUrl} alt="Company logo" fill style={{ objectFit: "contain" }} className="w-full" />
              </a>
            </div>
          )}

          <div className="flex flex-col gap-y-2 px-1 text-lg">
            {icons.map(({ icon: Icon, text, href }, index) => (
              <div key={index} className="flex items-center gap-x-2 dark:text-gray-100">
                <Icon width={24} height={24} />
                {href === null ? (
                  <Text element="span">{text}</Text>
                ) : (
                  <a
                    className="text-blue-950 hover:text-blue-900 dark:text-blue-100 dark:hover:text-blue-300"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {text}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
        {description && <RichText content={description} />}
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <Title element="h2">Arrangementer</Title>
        {isLoading ? (
          <EventListSkeleton />
        ) : (
          <EventList
            futureEventWithAttendances={futureEventWithAttendances}
            pastEventWithAttendances={pastEventWithAttendances}
            onLoadMore={fetchNextPage}
          />
        )}
      </div>
    </EntryDetailLayout>
  )
}
