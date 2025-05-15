import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { createSelectInput, useFormBuilder } from "../../../form"
import { notifyFail } from "../../../notifications"
import { useAdminForEventMutation as useAdminRegisterForEventMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"

interface ModalProps {
  userId: string
  attendanceId: string
  onSuccess?: () => void
}

const FormSchema = z.object({
  poolId: z.string(),
})

export const CreateManualUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId, userId, onSuccess },
}) => {
  const { mutate: createAttendee } = useAdminRegisterForEventMutation()

  const { data: attendance } = useAttendanceGetQuery(attendanceId)

  const onSubmit = (userId: string, attendancePoolId: string) => {
    createAttendee(
      {
        attendancePoolId: attendancePoolId,
        attendanceId: attendanceId,
        userId: userId,
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
      poolId: createSelectInput({
        label: "Påmeldingsgruppe",
        data: attendance?.pools.map((pool) => ({
          label: pool.title,
          value: pool.id,
        })),
      }),
    },
    label: "Meld på bruker",
    onSubmit: (values) => {
      try {
        onSubmit(userId, values.poolId)
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

export const openCreateManualUserAttendModal = ({ userId, attendanceId, onSuccess }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/create",
    title: "Meld på bruker",
    innerProps: { userId, attendanceId, onSuccess },
  })
