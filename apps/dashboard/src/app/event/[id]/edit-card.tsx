import { useGroupAllQuery } from "@/app/group/queries/use-group-all-query"
import { useInterestGroupAllQuery } from "@/app/interest-group/queries/use-interest-group-all-query"
import type { FC } from "react"
import { useEventEditForm } from "../components/edit-form"
import { useUpdateEventMutation } from "../mutations"
import { useEventContext } from "./provider"

export const EventEditCard: FC = () => {
  const event = useEventContext()
  const edit = useUpdateEventMutation()
  const { groups } = useGroupAllQuery()
  const { interestGroups } = useInterestGroupAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: event.hostingGroups.map((group) => group.slug),
    interestGroupIds: event.interestGroups.map((interestGroup) => interestGroup.id),
  }

  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    hostingGroups: groups,
    interestGroups: interestGroups,
    onSubmit: (data) => {
      const { hostingGroupIds, interestGroupIds, ...event } = data
      edit.mutate({
        id: data.id,
        event,
        groupIds: hostingGroupIds,
        interestGroupIds: interestGroupIds,
        companies: data.companies.map((company) => company.id),
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
