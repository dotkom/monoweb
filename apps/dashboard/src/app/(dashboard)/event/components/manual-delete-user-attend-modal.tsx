import type { AttendeeId } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { createCheckboxInput, useFormBuilder } from "../../../form"
import { notifyFail } from "../../../notifications"
import { useDeregisterForEventMutation } from "../mutations"

interface ModalProps {
  attendeeId: AttendeeId
  attendeeDisplayName: string
  poolName: string
  onSuccess?: () => void
}

const FormSchema = z.object({
  shouldReserveNextAttendee: z.boolean(),
})

export const ManualDeleteUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  innerProps: { attendeeId, attendeeDisplayName, poolName, onSuccess },
}) => {
  const { mutate: deregisterAttendee } = useDeregisterForEventMutation()

  const onSubmit = (attendeeId: string, reserveNextAttendee: boolean) => {
    deregisterAttendee(
      {
        attendeeId,
        reserveNextAttendee,
      },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )
  }

  const Form = useFormBuilder({
    schema: FormSchema,
    fields: {
      shouldReserveNextAttendee: createCheckboxInput({
        label: `Påmeld neste tilgjengelige i ${poolName}`,
        defaultChecked: true,
      }),
    },
    label: "Meld av bruker",
    onSubmit: (values) => {
      try {
        onSubmit(attendeeId, values.shouldReserveNextAttendee)
      } catch (e) {
        notifyFail({
          title: "Oops!",
          message: (e as Error).message,
        })
      }
    },
  })

  return <Form />
}

export const openDeleteManualUserAttendModal = ({ attendeeId, attendeeDisplayName, poolName, onSuccess }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/delete",
    title: `Meld av ${attendeeDisplayName}`,
    innerProps: { attendeeId, attendeeDisplayName, poolName, onSuccess },
  })
