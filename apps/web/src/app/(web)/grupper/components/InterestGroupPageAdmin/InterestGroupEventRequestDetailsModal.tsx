"use client"

import {
  InterestGroupEventStatusSchema,
  type InterestGroupEventSummaryWithRequest,
} from "@dotkomonline/rpc/interest-group-event"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { InterestGroupEventRequestStatusBadge } from "src/app/(admin)/admin/interessegrupper/components/InterestGroupEventRequestStatusBadge"
import { InterestGroupEventRequestWriteForm } from "./InterestGroupEventRequestWriteForm"

interface Props {
  onOpenChange: (open: boolean) => void
  eventWithRequest: InterestGroupEventSummaryWithRequest | null
}

export const InterestGroupEventRequestDetailsModal = ({ onOpenChange, eventWithRequest }: Props) => {
  return (
    <Dialog open={eventWithRequest !== null} onOpenChange={onOpenChange}>
      {eventWithRequest !== null && (
        <DialogContent
          size="2xl"
          initialFocus={false}
          className="max-h-[85dvh] overflow-y-auto data-[size=2xl]:max-w-4xl"
        >
          <DialogHeader>
            <div className="flex flex-row items-center gap-2">
              <DialogTitle>{eventWithRequest.title}</DialogTitle>
              <InterestGroupEventRequestStatusBadge status={eventWithRequest?.status} />
            </div>
          </DialogHeader>

          {eventWithRequest.request !== null &&
            eventWithRequest.status !== InterestGroupEventStatusSchema.enum.IN_REVIEW && (
              <section className="flex flex-col gap-3 rounded-xl bg-gray-100 dark:bg-stone-800 p-4">
                <Title element="h2" size="sm">
                  Svar fra Backlog
                </Title>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {eventWithRequest.request.reviewedAt !== null && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-sm font-medium">Behandlet</dt>
                      <dd className="text-sm text-muted-foreground">
                        {formatDate(eventWithRequest.request.reviewedAt, "d. MMM yyyy HH:mm")}
                      </dd>
                    </div>
                  )}
                  {eventWithRequest.status === "PUBLISHED" && eventWithRequest.request.approvedAmount !== null && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-sm font-medium">Godkjent beløp</dt>
                      <dd className="text-sm text-muted-foreground">{eventWithRequest.request.approvedAmount} kr</dd>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 sm:col-span-2">
                    <dt className="text-sm font-medium">Notat</dt>
                    <dd className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {eventWithRequest.request.reviewNote !== null && eventWithRequest.request.reviewNote.length > 0
                        ? eventWithRequest.request.reviewNote
                        : "Ikke oppgitt"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

          <InterestGroupEventRequestWriteForm
            showGuidelines={false}
            defaultValues={{
              title: eventWithRequest.title,
              description: eventWithRequest.description,
              start: eventWithRequest.start,
              end: eventWithRequest.end,
              registerEnd: eventWithRequest.registerEnd,
              deregisterDeadline: eventWithRequest.deregisterDeadline,
              imageUrl: eventWithRequest.imageUrl,
              locationTitle: eventWithRequest.locationTitle,
              locationAddress: eventWithRequest.locationAddress,
              locationLink: eventWithRequest.locationLink,
              requestDescription: eventWithRequest.request?.description ?? "",
              requestedAmount: eventWithRequest.request?.requestedAmount?.toString() ?? "",
              expectedAttendeeCount: eventWithRequest.request?.expectedAttendeeCount?.toString() ?? "",
            }}
            disabled
            onSubmit={() => {}}
            onFileUpload={async () => eventWithRequest.imageUrl ?? ""}
          />
        </DialogContent>
      )}
    </Dialog>
  )
}
