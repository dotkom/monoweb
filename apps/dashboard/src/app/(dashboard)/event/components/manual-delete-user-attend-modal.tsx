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
  bypassCriteriaOnReserveNextAttendee: z.boolean(),
})

export const ManualDeleteUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendeeId, poolName, onSuccess },
}) => {
  const { mutate: deregisterAttendee } = useDeregisterForEventMutation()

  const onSubmit = (attendeeId: string, reserveNextAttendee: boolean, bypassCriteriaOnReserveNextAttendee: boolean) => {
    deregisterAttendee(
      {
        attendeeId,
        reserveNextAttendee,
        bypassCriteriaOnReserveNextAttendee,
      },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )

    context.closeModal(id)
  }

  const Form = useFormBuilder({
    schema: FormSchema,
    fields: {
      shouldReserveNextAttendee: createCheckboxInput({
        label: "Påmeld neste bruker i venteliste",
        defaultChecked: true,
        description: `Påmeld neste bruker som oppfyller kriteriene for påmelding i ${poolName}.`,
      }),
      bypassCriteriaOnReserveNextAttendee: createCheckboxInput({
        label: "Ignorer kriterier for påmelding av neste bruker",
        defaultChecked: false,
        description:
          "Hvis sant, neste bruker vil bli påmeldt selv om de ikke oppfyller kriteriene for påmelding. Bruk dette om påmeldingsfristen er utløpt men du vil påmelde neste bruker.",
      }),
    },
    label: "Meld av bruker",
    onSubmit: (values) => {
      try {
        onSubmit(attendeeId, values.shouldReserveNextAttendee, values.bypassCriteriaOnReserveNextAttendee)
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
