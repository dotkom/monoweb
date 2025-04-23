import type { FC } from "react"
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query"
import { useGroupAllQuery } from "../../../../modules/group/queries/use-group-all-query"
import { useEventEditForm } from "../components/edit-form"
import { useDeleteEventMutation, useEditEventWithGroupsMutation } from "../mutations"
import { useEventDetailsContext } from "./provider"
import { Button, Group } from "@mantine/core"
import { modals } from "@mantine/modals"

export const EventEditCard: FC = () => {
  const { event, eventHostingGroups, eventInterestGroups } = useEventDetailsContext()
  const edit = useEditEventWithGroupsMutation()
  const deleteEvent = useDeleteEventMutation()
  const { groups } = useGroupAllQuery()
  const { interestGroups } = useInterestGroupAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: eventHostingGroups.map((group) => group.id),
    interestGroupIds: eventInterestGroups.map((interestGroup) => interestGroup.id),
  }

  const openDeleteModal = () => {
    modals.openConfirmModal({
      title: "Slett arrangement",
      children: <p>Er du sikker på at du vil slette dette arrangementet? Denne handlingen kan ikke angres.</p>,
      labels: { confirm: "Slett", cancel: "Avbryt" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteEvent.mutate(event.id),
    })
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
    extraButtons: (
      <Button color="red" onClick={openDeleteModal}>
        Slett arrangement
      </Button>
    ),
  })

  return <FormComponent />
}
