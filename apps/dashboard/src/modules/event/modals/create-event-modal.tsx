import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useEventWriteForm } from "../../../app/(dashboard)/event/write-form"
import { useCreateEventMutation } from "../mutations/use-create-event-mutation"

export const CreateEventModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateEventMutation()
  const FormComponent = useEventWriteForm({
    onSubmit: (data) => {
      const { hostingGroupIds, interestGroupIds, ...event } = data
      create.mutate({
        groupIds: hostingGroupIds,
        interestGroupIds: interestGroupIds,
        event,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateEventModal = () => () =>
  modals.openContextModal({
    modal: "event/create",
    title: "Opprett nytt arrangement",
    innerProps: {},
  })
