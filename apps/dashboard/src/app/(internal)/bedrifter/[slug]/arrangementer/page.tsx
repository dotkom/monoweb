"use client"

import { EventTable } from "@/app/(internal)/arrangementer/components/events-table"
import { Text, Title } from "@dotkomonline/ui"
import { useCompanyEventsAllInfiniteQuery } from "../../queries"
import { useCompanyDetailsContext } from "../provider"

export default function CompanyArrangementerPage() {
  const { company } = useCompanyDetailsContext()
  const { events, fetchNextPage } = useCompanyEventsAllInfiniteQuery(company.id)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Title>Arrangementer</Title>
        <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne bedriften.</Text>
      </div>

      <EventTable events={events} onLoadMore={fetchNextPage} />
    </div>
  )
}
