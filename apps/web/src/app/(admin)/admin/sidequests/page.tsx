"use client"

import { SidequestStatusSchema } from "@dotkomonline/rpc/sidequest"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import Link from "next/link"
import { SidequestTable } from "./components/SidequestTable"
import { useSidequestsWithRequestQuery } from "./queries"

export default function SidequestsPage() {
  const eventsInReviewQuery = useSidequestsWithRequestQuery({
    filter: { byStatus: [SidequestStatusSchema.enum.IN_REVIEW] },
  })
  const processedEventsQuery = useSidequestsWithRequestQuery({
    filter: { byStatus: [SidequestStatusSchema.enum.PUBLISHED, SidequestStatusSchema.enum.REJECTED] },
  })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Sidequests
      </Title>

      <Tabs defaultValue="in-review">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="in-review">Til vurdering</TabsTrigger>
            <TabsTrigger value="processed">Behandlet</TabsTrigger>
          </TabsList>
          <Button variant="default" element={Link} href="/admin/sidequests/ny">
            Ny Sidequest
          </Button>
        </div>

        <TabsContent value="in-review" className="pt-4">
          <SidequestTable
            events={eventsInReviewQuery.events}
            isLoading={eventsInReviewQuery.isLoading}
            isFetchingNextPage={eventsInReviewQuery.isFetchingNextPage}
            hasNextPage={eventsInReviewQuery.hasNextPage}
            fetchNextPage={eventsInReviewQuery.fetchNextPage}
            isPlaceholderData={eventsInReviewQuery.isPlaceholderData}
          />
        </TabsContent>
        <TabsContent value="processed" className="pt-4">
          <SidequestTable
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
