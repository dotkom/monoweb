"use client"

import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import Link from "next/link"
import { InterestGroupEventTable } from "./components/InterestGroupEventTable"
import { useInterestGroupEventsWithRequestQuery } from "./queries"

export default function InterestGroupEventsPage() {
  const eventsInReviewQuery = useInterestGroupEventsWithRequestQuery({ filter: { byStatus: ["IN_REVIEW"] } })
  const processedEventsQuery = useInterestGroupEventsWithRequestQuery({
    filter: { byStatus: ["PUBLISHED", "REJECTED"] },
  })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Interessegruppearrangementer
      </Title>

      <Tabs defaultValue="in-review">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="in-review">Til vurdering</TabsTrigger>
            <TabsTrigger value="processed">Behandlet</TabsTrigger>
          </TabsList>
          <Button variant="default" element={Link} href="/admin/interessegrupper/ny">
            Nytt interessegruppearrangement
          </Button>
        </div>

        <TabsContent value="in-review" className="pt-4">
          <InterestGroupEventTable
            events={eventsInReviewQuery.events}
            isLoading={eventsInReviewQuery.isLoading}
            isFetchingNextPage={eventsInReviewQuery.isFetchingNextPage}
            hasNextPage={eventsInReviewQuery.hasNextPage}
            fetchNextPage={eventsInReviewQuery.fetchNextPage}
            isPlaceholderData={eventsInReviewQuery.isPlaceholderData}
          />
        </TabsContent>
        <TabsContent value="processed" className="pt-4">
          <InterestGroupEventTable
            events={processedEventsQuery.events}
            isLoading={processedEventsQuery.isLoading}
            isFetchingNextPage={processedEventsQuery.isFetchingNextPage}
            hasNextPage={processedEventsQuery.hasNextPage}
            fetchNextPage={processedEventsQuery.fetchNextPage}
            isPlaceholderData={processedEventsQuery.isPlaceholderData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
