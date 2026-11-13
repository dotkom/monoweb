"use client"

import { useInterestGroupAdminContext } from "@/app/interessegrupper/[slug]/admin/context"
import { useCreateSidequestRequest, useSidequestImageUpload } from "@/app/interessegrupper/[slug]/admin/mutations"
import { getInterestGroupAdminUrl } from "@dotkomonline/rpc/group"
import { Title } from "@dotkomonline/ui"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SidequestRequestWriteForm,
  type SidequestRequestWriteFormValues,
} from "../../components/SidequestRequestWriteForm"

export default function InterestGroupNewSoknadPage() {
  const { group } = useInterestGroupAdminContext()
  const router = useRouter()
  const createSidequestRequest = useCreateSidequestRequest()
  const uploadImage = useSidequestImageUpload(group.slug)

  const handleSubmit = (data: SidequestRequestWriteFormValues) => {
    createSidequestRequest.mutate(
      {
        interestGroupId: group.slug,
        sidequest: {
          title: data.title,
          description: data.description,
          start: data.start,
          end: data.end,
          registerEnd: data.registerEnd,
          deregisterDeadline: data.deregisterDeadline,
          imageUrl: data.imageUrl ?? "",
          locationTitle: data.locationTitle ?? null,
          locationAddress: data.locationAddress ?? null,
          locationLink: data.locationLink ?? null,
          capacity: data.capacity,
        },
        sidequestRequest: {
          description: data.requestDescription.trim() !== "" ? data.requestDescription : null,
          requestedAmount: data.requestedAmount !== "" ? Number(data.requestedAmount) : null,
          expectedAttendeeCount: data.expectedAttendeeCount !== "" ? Number(data.expectedAttendeeCount) : null,
        },
      },
      {
        onSuccess: () => {
          router.push(getInterestGroupAdminUrl(group.slug))
        },
      }
    )
  }

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

      <div className="flex flex-col gap-6">
        <Title element="h1" className="text-2xl">
          Søk om å arrangere en Sidequest
        </Title>
        <SidequestRequestWriteForm onSubmit={handleSubmit} onFileUpload={uploadImage} />
      </div>
    </div>
  )
}
