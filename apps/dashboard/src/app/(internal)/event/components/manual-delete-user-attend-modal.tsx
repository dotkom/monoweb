import type { AttendeeId } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useDeregisterForEventMutation } from "../mutations"

interface ModalProps {
  attendeeId: AttendeeId
  attendeeName: string
  poolName: string
  onSuccess?: () => void
}

export const ManualDeleteUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendeeId, onSuccess },
}) => {
  const { mutate: deregisterAttendee } = useDeregisterForEventMutation()

  const onSubmit = (attendeeId: string) => {
    deregisterAttendee(
      {
        attendeeId,
      },
      {
        onSuccess: () => {
          onSuccess?.()
        },
      }
    )

    context.closeModal(id)
  }

  return <Button onClick={() => onSubmit(attendeeId)}>Meld av bruker</Button>
}

export const openDeleteManualUserAttendModal = ({ attendeeId, attendeeName, poolName, onSuccess }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/delete",
    title: `Meld av ${attendeeName}`,
    innerProps: { attendeeId, attendeeName, poolName, onSuccess },
  })
