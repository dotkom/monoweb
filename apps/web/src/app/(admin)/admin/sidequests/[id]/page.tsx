"use client"

import { SidequestStatusSchema, type SidequestRequestReviewWrite } from "@dotkomonline/rpc/sidequest"
import { Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { useUserQuery } from "../../brukere/queries"
import type { SidequestWriteFormData } from "../components/SidequestWriteForm"
import { SidequestWriteForm } from "../components/SidequestWriteForm"
import { useSidequestImageUpload, useReviewSidequestRequestMutation, useUpdateSidequestMutation } from "../mutations"
import { SidequestRequestReviewWriteForm } from "./components/SidequestRequestReviewWriteForm"
import { useSidequestDetailsContext } from "./provider"

export default function SidequestInfoPage() {
  const { sidequest } = useSidequestDetailsContext()
  const request = sidequest.request

  const { data: requestedByUser } = useUserQuery(request?.requestedById ?? null)

  const updateEvent = useUpdateSidequestMutation()
  const uploadImage = useSidequestImageUpload()
  const reviewRequest = useReviewSidequestRequestMutation()

  // If there is no request, the event was created by an admin and can be published manually
  const canSetStatus = sidequest.request === null

  const onSubmitReview = (data: SidequestRequestReviewWrite) => {
    if (request === null) {
      return
    }

    reviewRequest.mutate({
      id: request.id,
      review: data,
    })
  }

  const onSubmitEvent = (data: SidequestWriteFormData) => {
    updateEvent.mutate({
      id: sidequest.id,
      sidequest: {
        ...data,
        imageUrl: data.imageUrl ?? "",
        status: canSetStatus ? data.status : sidequest.status,
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
                <RequestDetail
                  label="Fordelt på personer"
                  value={request.expectedAttendeeCount !== null ? String(request.expectedAttendeeCount) : null}
                />
                <RequestDetail
                  label="Søkt beløp"
                  value={request.requestedAmount !== null ? `${request.requestedAmount} kr` : null}
                />
                <RequestDetail label="Tilleggsinformasjon" value={request.description} />
              </dl>
            </div>
            <div className="flex flex-col gap-3">
              <Title element="h3" className="text-base font-medium">
                Godkjenning
              </Title>
              <SidequestRequestReviewWriteForm
                defaultValues={{
                  reviewNote: request.reviewNote ?? null,
                  approvedAmount: String(request.approvedAmount ?? request.requestedAmount ?? ""),
                }}
                onSubmit={onSubmitReview}
              />
            </div>
          </div>
        </section>
      )}

      <SidequestWriteForm
        defaultValues={{
          title: sidequest.title,
          description: sidequest.description,
          start: sidequest.start,
          end: sidequest.end,
          registerEnd: sidequest.registerEnd,
          deregisterDeadline: sidequest.deregisterDeadline,
          imageUrl: sidequest.imageUrl,
          locationTitle: sidequest.locationTitle,
          locationAddress: sidequest.locationAddress,
          locationLink: sidequest.locationLink,
          interestGroupId: sidequest.interestGroupId,
          status:
            sidequest.status === SidequestStatusSchema.enum.PUBLISHED
              ? SidequestStatusSchema.enum.PUBLISHED
              : SidequestStatusSchema.enum.IN_REVIEW,
          capacity: sidequest.capacity,
        }}
        onFileUpload={uploadImage}
        onSubmit={onSubmitEvent}
        submitLabel="Lagre Sidequest"
        canSetStatus={canSetStatus}
      />
    </div>
  )
}

function RequestDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="text-sm text-muted-foreground">{value != null && value !== "" ? value : "Ikke oppgitt"}</dd>
    </div>
  )
}
