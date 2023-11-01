import { Event, EventExtra } from "@dotkomonline/types"
import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useEditEventMutation } from "../mutations/use-edit-event-mutation"
import { ExtrasForm, ExtrasFormValues } from "../../../components/molecules/extras-form/ExtrasForm"

export const UpdateEventExtrasModal: FC<ContextModalProps<{ existingExtra: EventExtra; event: Event }>> = ({
  context,
  id,
  innerProps,
}) => {
  const editEvent = useEditEventMutation()

  const allExtras = innerProps.event.extras || []
  const existingExtra = innerProps.existingExtra

  const defaultAlternatives = {
    question: existingExtra.name,
    alternatives: existingExtra.choices.map((choice) => ({
      value: choice.name,
    })),
  }

  const onSubmit = (data: ExtrasFormValues) => {
    const newExtras = allExtras.map((extra) => {
      if (extra.id === existingExtra.id) {
        return {
          id: extra.id,
          name: data.question,
          choices: data.alternatives.map((alternative, i) => ({
            id: `${i}`,
            name: alternative.value,
          })),
        }
      }
      return extra
    })

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

export const useEditEventExtrasModal = ({ event }: { event: Event }) => {
  return (existingExtra: EventExtra) =>
    modals.openContextModal({
      modal: "extras/update",
      title: "Endre extra",
      innerProps: {
        event,
        existingExtra,
      },
    })
}
