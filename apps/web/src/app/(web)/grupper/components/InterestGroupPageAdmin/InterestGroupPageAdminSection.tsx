"use client"

import type { Group } from "@dotkomonline/rpc/group"
import type { InterestGroupEventSummaryWithRequest } from "@dotkomonline/rpc/interest-group-event"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import { useState } from "react"
import { CreateInterestGroupEventRequestModal } from "./CreateInterestGroupEventRequestModal"
import { InterestGroupEventInReviewTable } from "./InterestGroupEventInReviewTable"
import { InterestGroupEventRequestDetailsModal } from "./InterestGroupEventRequestDetailsModal"
import type { InterestGroupEventRequestWriteFormValues } from "./InterestGroupEventRequestWriteForm"
import { InterestGroupPublishedEventTable } from "./InterestGroupPublishedEventTable"
import { useCreateInterestGroupEventRequest, useInterestGroupEventImageUpload } from "./mutations"
import { useInterestGroupEventsWithReview } from "./queries"

interface Props {
  interestGroup: Group
}

export const InterestGroupPageAdminSection = ({ interestGroup }: Props) => {
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<InterestGroupEventSummaryWithRequest | null>(null)

  const createInterestGroupEventRequest = useCreateInterestGroupEventRequest()
  const uploadImage = useInterestGroupEventImageUpload(interestGroup.slug)

  const { eventsWithReview: eventsInReview, ...eventsInReviewQuery } = useInterestGroupEventsWithReview(
    interestGroup.slug,
    ["IN_REVIEW", "REJECTED"]
  )
  const { eventsWithReview: publishedEvents, ...publishedEventsQuery } = useInterestGroupEventsWithReview(
    interestGroup.slug,
    ["PUBLISHED"]
  )

  const handleSubmit = (data: InterestGroupEventRequestWriteFormValues) => {
    createInterestGroupEventRequest.mutate(
      {
        interestGroupId: interestGroup.slug,
        interestGroupEvent: {
          title: data.title,
          description: data.description,
          start: data.start,
          end: data.end,
          registerEnd: data.registerEnd,
          deregisterDeadline: data.deregisterDeadline,
          imageUrl: data.imageUrl,
          locationTitle: data.locationTitle ?? null,
          locationAddress: data.locationAddress ?? null,
          locationLink: data.locationLink ?? null,
        },
        interestGroupEventRequest: {
          description: data.requestDescription ?? null,
          requestedAmount: Number(data.requestedAmount),
          expectedAttendeeCount: Number(data.expectedAttendeeCount),
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
        },
      }
    )
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <Title element="h2">Administrer interessegruppen</Title>
        <Button variant="default" onClick={() => setOpen(true)}>
          Søk om å arrangere et arrangement
        </Button>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Søknader</TabsTrigger>
          <TabsTrigger value="events">Publiserte arrangementer</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <InterestGroupEventInReviewTable
            events={eventsInReview}
            onSelect={setSelectedEvent}
            fetchNextPage={eventsInReviewQuery.fetchNextPage}
            hasNextPage={eventsInReviewQuery.hasNextPage}
            isFetchingNextPage={eventsInReviewQuery.isFetchingNextPage}
            isPlaceholderData={eventsInReviewQuery.isPlaceholderData}
            isLoading={eventsInReviewQuery.isLoading}
          />
        </TabsContent>
        <TabsContent value="events">
          <InterestGroupPublishedEventTable
            events={publishedEvents}
            onSelect={setSelectedEvent}
            fetchNextPage={publishedEventsQuery.fetchNextPage}
            hasNextPage={publishedEventsQuery.hasNextPage}
            isFetchingNextPage={publishedEventsQuery.isFetchingNextPage}
            isPlaceholderData={publishedEventsQuery.isPlaceholderData}
            isLoading={publishedEventsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      <CreateInterestGroupEventRequestModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        onFileUpload={uploadImage}
      />

      <InterestGroupEventRequestDetailsModal
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvent(null)
          }
        }}
        eventWithRequest={selectedEvent}
      />
    </section>
  )
}
