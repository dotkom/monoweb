"use client"

import type { InterestGroupEventRequestReviewWrite } from "@dotkomonline/rpc/interest-group-event"
import { Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { useUserQuery } from "../../brukere/queries"
import type { InterestGroupEventWriteFormData } from "../components/InterestGroupEventWriteForm"
import { InterestGroupEventWriteForm } from "../components/InterestGroupEventWriteForm"
import {
  useInterestGroupEventImageUpload,
  useReviewInterestGroupEventRequestMutation,
  useUpdateInterestGroupEventMutation,
} from "../mutations"
import { InterestGroupEventRequestReviewWriteForm } from "./components/InterestGroupEventRequestReviewWriteForm"
import { useInterestGroupEventDetailsContext } from "./provider"

export default function InterestGroupEventInfoPage() {
  const { interestGroupEvent } = useInterestGroupEventDetailsContext()
  const request = interestGroupEvent.request

  const { data: requestedByUser } = useUserQuery(request?.requestedById ?? null)

  const updateEvent = useUpdateInterestGroupEventMutation()
  const uploadImage = useInterestGroupEventImageUpload()
  const reviewRequest = useReviewInterestGroupEventRequestMutation()

  // If there is no request, the event was created by an admin and can be published manually
  const canSetStatus = interestGroupEvent.request === null

  const onSubmitReview = (data: InterestGroupEventRequestReviewWrite) => {
    if (request === null) {
      return
    }

    reviewRequest.mutate({
      id: request.id,
      review: data,
    })
  }

  const onSubmitEvent = (data: InterestGroupEventWriteFormData) => {
    updateEvent.mutate({
      id: interestGroupEvent.id,
      interestGroupEvent: {
        ...data,
        status: canSetStatus ? data.status : interestGroupEvent.status,
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {request !== null && (
        <section className="flex flex-col gap-3 rounded-xl bg-gray-100 dark:bg-stone-800 p-4">
          <Title element="h2" size="sm">
            Søknad
          </Title>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Title element="h3" className="text-base font-medium">
                Detaljer
              </Title>
              <dl className="grid gap-3 max-w-md sm:grid-cols-2">
                <RequestDetail label="Søker" value={requestedByUser?.name ?? null} />
                <RequestDetail label="Opprettet" value={formatDate(request.createdAt, "d. MMM yyyy HH:mm")} />
                <RequestDetail label="Forventet oppmøte" value={String(request.expectedAttendeeCount)} />
                <RequestDetail label="Søkt beløp" value={`${request.requestedAmount} kr`} />
                <RequestDetail label="Tilleggsinformasjon" value={request.description} />
              </dl>
            </div>
            <div className="flex flex-col gap-3">
              <Title element="h3" className="text-base font-medium">
                Godkjenning
              </Title>
              <InterestGroupEventRequestReviewWriteForm
                defaultValues={{
                  reviewNote: request.reviewNote ?? null,
                  approvedAmount: String(request.approvedAmount ?? request.requestedAmount),
                }}
                onSubmit={onSubmitReview}
              />
            </div>
          </div>
        </section>
      )}

      <InterestGroupEventWriteForm
        defaultValues={{
          title: interestGroupEvent.title,
          description: interestGroupEvent.description,
          start: interestGroupEvent.start,
          end: interestGroupEvent.end,
          registerEnd: interestGroupEvent.registerEnd,
          deregisterDeadline: interestGroupEvent.deregisterDeadline,
          imageUrl: interestGroupEvent.imageUrl,
          locationTitle: interestGroupEvent.locationTitle,
          locationAddress: interestGroupEvent.locationAddress,
          locationLink: interestGroupEvent.locationLink,
          interestGroupId: interestGroupEvent.interestGroupId,
          status: interestGroupEvent.status === "PUBLISHED" ? "PUBLISHED" : "IN_REVIEW",
        }}
        onFileUpload={uploadImage}
        onSubmit={onSubmitEvent}
        submitLabel="Lagre arrangement"
        canSetStatus={canSetStatus}
      />
    </div>
  )
}

function RequestDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="text-sm text-muted-foreground">{value && value.length > 0 ? value : "Ikke oppgitt"}</dd>
    </div>
  )
}
