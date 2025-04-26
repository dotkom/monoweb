import type { FC } from "react"
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query"
import { useGroupAllQuery } from "../../../../modules/group/queries/use-group-all-query"
import { useEventEditForm } from "../components/edit-form"
import { useEditEventWithGroupsMutation } from "../mutations"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, hostingGroups, hostingInterestGroups } = useEventDetailsContext()
  const edit = useEditEventWithGroupsMutation()
  const { groups } = useGroupAllQuery()
  const { interestGroups } = useInterestGroupAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: hostingGroups.map((group) => group.id),
    interestGroupIds: hostingInterestGroups.map((interestGroup) => interestGroup.id),
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
        groups: hostingGroupIds,
        interestGroups: interestGroupIds,
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
