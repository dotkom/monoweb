"use client"

import { EventList, EventListSkeleton } from "@/app/arrangementer/components/EventList"
import { useEventAllSummariesInfiniteQuery, useEventAllSummariesQuery } from "@/app/arrangementer/components/queries"
import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import type { Company } from "@dotkomonline/types"
import { RichText, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconMail, IconMapPin, IconPhone, IconWorld } from "@tabler/icons-react"
import { roundToNearestMinutes } from "date-fns"
import Image from "next/image"
import type { FC } from "react"

interface CompanyViewProps {
  company: Company
}

function buildCompanyLinks(company: Company) {
  const urls = [{ icon: IconWorld, text: "Nettside", href: company.website as string | null }]
  if (company.location !== null && company.location !== "") {
    urls.push({ icon: IconMapPin, text: company.location, href: null })
  }
  if (company.email !== null && company.email !== "") {
    urls.push({ icon: IconMail, text: company.email, href: `mailto:${company.email}` })
  }
  if (company.phone !== null && company.phone !== "") {
    urls.push({ icon: IconPhone, text: company.phone, href: `tel:${company.phone}` })
  }
  return urls
}

export const CompanyView: FC<CompanyViewProps> = ({ company }) => {
  const icons = buildCompanyLinks(company)
  const now = roundToNearestMinutes(getCurrentUTC(), {
    roundingMethod: "floor",
  })

  const { eventDetails: futureEventWithAttendances, isLoading } = useEventAllSummariesQuery({
    filter: {
      byOrganizingCompany: [company.id],
      byStartDate: { min: now, max: null },
    },
  })

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllSummariesInfiniteQuery({
    filter: {
      byOrganizingCompany: [company.id],
      byEndDate: {
        max: now,
        min: null,
      },
    },
  })

  return (
    <EntryDetailLayout title={company.name}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-600 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {company.imageUrl && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <a href={company.website} target="_blank" rel="noreferrer">
                <Image
                  src={company.imageUrl}
                  alt="Company logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="w-full"
                  width={0}
                  height={0}
                />
              </a>
            </div>
          )}
          <div className="flex flex-col gap-y-2 px-1 text-lg bg-gray-100 dark:bg-stone-700 rounded-2xl p-4 pl-6">
            {icons.map(({ icon: Icon, text, href }) => (
              <div key={`${text}-${href ?? "no-link"}`} className="flex items-center gap-x-2 dark:text-gray-100">
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
        {company.description && <RichText content={company.description} />}
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
