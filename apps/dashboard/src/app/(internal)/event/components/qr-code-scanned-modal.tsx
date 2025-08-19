import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { notifyFail } from "@/lib/notifications"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { useAdminForEventMutation as useAdminRegisterForEventMutation, useUpdateEventAttendanceMutation } from "../mutations"
import { useAttendanceGetByAttendeeIdQuery, useAttendanceGetQuery } from "../queries"
import { Attendance, AttendeeId, getAttendee } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { Stack } from "@mantine/core"

interface ModalProps {
  attendance: Attendance | undefined
  isLoading: boolean
  attendeeId: AttendeeId
}

const FormSchema = z.object({
  poolId: z.string(),
})

export const QRCodeScannedModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendance, isLoading, attendeeId },
}) => {
  const registerAttendance = useUpdateEventAttendanceMutation()

  const attendee = attendance?.attendees?.find((attendee) => attendee.id === attendeeId)

  const onSubmit = () => {
    registerAttendance.mutate({ id: attendeeId, at: getCurrentUTC() })

    context.closeModal(id)
  }

  return (
    <Stack>
        test
    </Stack>
  )
}

export const openQRCodeScannedModal = ({ attendeeId }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/qr-code-scanned",
    title: "Meld på bruker",
    innerProps: { attendeeId },
  })
