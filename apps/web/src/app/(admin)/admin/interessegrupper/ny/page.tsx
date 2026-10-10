"use client"

import { useTRPC } from "@admin/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { useQuery } from "@tanstack/react-query"
import {
  INTEREST_GROUP_EVENT_WRITE_FORM_DEFAULT_VALUES,
  InterestGroupEventWriteForm,
} from "../components/InterestGroupEventWriteForm"
import { useCreateInterestGroupEventMutation, useInterestGroupEventImageUpload } from "../mutations"

export default function InterestGroupEventNewPage() {
  const trpc = useTRPC()
  const { data: interestGroups = [] } = useQuery(trpc.group.allByType.queryOptions("INTEREST_GROUP"))

  const createEvent = useCreateInterestGroupEventMutation()
  const uploadImage = useInterestGroupEventImageUpload()

  return (
    <div className="flex flex-col gap-4">
      <InterestGroupEventWriteForm
        defaultValues={INTEREST_GROUP_EVENT_WRITE_FORM_DEFAULT_VALUES}
        canSelectInterestGroup
        canSetStatus
        interestGroupOptions={interestGroups.map((group) => ({
          value: group.slug,
          label: getGroupDisplayName(group),
        }))}
        onFileUpload={uploadImage}
        onSubmit={(data) => {
          createEvent.mutate({
            interestGroupEvent: data,
          })
        }}
        submitLabel="Opprett arrangement"
      />
    </div>
  )
}
