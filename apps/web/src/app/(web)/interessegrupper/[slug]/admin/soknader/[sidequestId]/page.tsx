"use client"

import { SidequestRequestStatusBadge } from "@/app/(admin)/admin/sidequests/components/SidequestRequestStatusBadge"
import { useInterestGroupAdminContext } from "@/app/interessegrupper/[slug]/admin/context"
import { useTRPC } from "@/utils/trpc/client"
import { getInterestGroupAdminUrl } from "@dotkomonline/rpc/group"
import { SidequestStatusSchema } from "@dotkomonline/rpc/sidequest"
import { Title } from "@dotkomonline/ui"
import { IconArrowLeft } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SidequestRequestWriteForm } from "../../components/SidequestRequestWriteForm"

export default function InterestGroupSoknadPage() {
  const trpc = useTRPC()
  const { sidequestId } = useParams<{ sidequestId: string }>()
  const { group } = useInterestGroupAdminContext()

  const { data: sidequest, isLoading } = useQuery(trpc.sidequest.getByIdWithRequest.queryOptions(sidequestId))

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={getInterestGroupAdminUrl(group.slug)}
        prefetch={false}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Tilbake til administrasjon
      </Link>

      {isLoading || sidequest === undefined ? (
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <Title element="h1" className="text-2xl">
              {sidequest.title}
            </Title>
            <SidequestRequestStatusBadge status={sidequest.status} />
          </div>

          {sidequest.request !== null && sidequest.status !== SidequestStatusSchema.enum.IN_REVIEW && (
            <section className="flex flex-col gap-3 rounded-lg bg-gray-100 p-4 dark:bg-stone-800">
              <Title element="h2" size="sm">
                Svar fra Backlog
              </Title>
              <dl className="grid gap-3 sm:grid-cols-2">
                {sidequest.request.reviewedAt !== null && (
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-sm font-medium">Behandlet</dt>
                    <dd className="text-sm text-muted-foreground">
                      {formatDate(sidequest.request.reviewedAt, "d. MMM yyyy HH:mm")}
                    </dd>
                  </div>
                )}
                {sidequest.status === SidequestStatusSchema.enum.PUBLISHED &&
                  sidequest.request.approvedAmount !== null && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-sm font-medium">Godkjent beløp</dt>
                      <dd className="text-sm text-muted-foreground">{sidequest.request.approvedAmount} kr</dd>
                    </div>
                  )}
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <dt className="text-sm font-medium">Notat</dt>
                  <dd className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {sidequest.request.reviewNote !== null && sidequest.request.reviewNote.length > 0
                      ? sidequest.request.reviewNote
                      : "Ikke oppgitt"}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <SidequestRequestWriteForm
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
              requestDescription: sidequest.request?.description ?? "",
              requestedAmount: sidequest.request?.requestedAmount?.toString() ?? "",
              expectedAttendeeCount: sidequest.request?.expectedAttendeeCount?.toString() ?? "",
              capacity: sidequest.capacity,
            }}
            disabled
            onSubmit={() => {}}
            onFileUpload={async () => sidequest.imageUrl ?? ""}
          />
        </div>
      )}
    </div>
  )
}
