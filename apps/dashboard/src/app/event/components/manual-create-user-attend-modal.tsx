import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { notifyFail } from "@/lib/notifications"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { useAdminForEventMutation as useAdminRegisterForEventMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"

interface ModalProps {
  userId: string
  attendanceId: string
}

const FormSchema = z.object({
  poolId: z.string(),
})

export const ManualCreateUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId, userId },
}) => {
  const { mutate: createAttendee } = useAdminRegisterForEventMutation()

  const { data: attendance } = useAttendanceGetQuery(attendanceId)

  const onSubmit = (userId: string, attendancePoolId: string) => {
    createAttendee({
      attendancePoolId: attendancePoolId,
      attendanceId: attendanceId,
      userId: userId,
    })

    context.closeModal(id)
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

export const openManualCreateUserAttendModal = ({ userId, attendanceId }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/create",
    title: "Meld på bruker",
    innerProps: { userId, attendanceId },
  })
