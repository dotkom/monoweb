import type { Event } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { ExtrasForm, type ExtrasFormValues } from "../../../components/molecules/extras-form/ExtrasForm"
import { useEditEventMutation } from "../mutations/use-edit-event-mutation"

export const CreateEventExtrasModal: FC<ContextModalProps<{ event: Event }>> = ({ context, id, innerProps }) => {
  const editEvent = useEditEventMutation()
  const allExtras = innerProps.event.extras || []

  const defaultAlternatives: ExtrasFormValues = {
    question: "",
    alternatives: [{ value: "" }],
  }

  const onSubmit = (data: ExtrasFormValues) => {
    const newExtras = [
      ...allExtras,
      {
        id: `${allExtras.length - 1}`,
        name: data.question,
        choices: data.alternatives.map((alternative, i) => ({
          id: `${i}`,
          name: alternative.value,
        })),
      },
    ]

    editEvent.mutate({
      id: innerProps.event.id,
      event: {
        ...innerProps.event,
        extras: newExtras,
      },
    })

    context.closeModal(id)
  }

  return <ExtrasForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useCreateEventExtrasModal =
  ({ event }: { event: Event }) =>
  () =>
    modals.openContextModal({
      modal: "extras/create",
      title: "Legg til nytt deltakervalg",
      innerProps: {
        event,
      },
    })
