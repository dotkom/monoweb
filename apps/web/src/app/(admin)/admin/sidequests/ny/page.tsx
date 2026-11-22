"use client"

import { useTRPC } from "@admin/lib/trpc-client"
import { getGroupDisplayName, GroupTypeSchema } from "@dotkomonline/rpc/group"
import { useQuery } from "@tanstack/react-query"
import { SIDEQUEST_WRITE_FORM_DEFAULT_VALUES, SidequestWriteForm } from "../components/SidequestWriteForm"
import { useCreateSidequestMutation, useSidequestImageUpload } from "../mutations"

export default function SidequestNewPage() {
  const trpc = useTRPC()
  const { data: interestGroups = [] } = useQuery(trpc.group.allByType.queryOptions(GroupTypeSchema.enum.INTEREST_GROUP))

  const createEvent = useCreateSidequestMutation()
  const uploadImage = useSidequestImageUpload()

  return (
    <div className="flex flex-col gap-4">
      <SidequestWriteForm
        defaultValues={SIDEQUEST_WRITE_FORM_DEFAULT_VALUES}
        canSelectInterestGroup
        canSetStatus
        interestGroupOptions={interestGroups.map((group) => ({
          value: group.slug,
          label: getGroupDisplayName(group),
        }))}
        onFileUpload={uploadImage}
        onSubmit={(data) => {
          createEvent.mutate({
            sidequest: {
              ...data,
              imageUrl: data.imageUrl ?? "",
            },
          })
        }}
        submitLabel="Opprett Sidequest"
      />
    </div>
  )
}
