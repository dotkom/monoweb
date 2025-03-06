import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { createSelectInput, useFormBuilder } from "../../../app/form"
import { notifyFail } from "../../../app/notifications"
import { useRegisterForEventMutation } from "../mutations/use-attendee-mutations"
import { useAttendanceGetQuery } from "../queries/use-get-queries"

interface ModalProps {
  userId: string
  attendanceId: string
}

const FormSchema = z.object({
  attendancePoolId: z.string(),
})

export const CreateManualUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  innerProps: { attendanceId, userId },
}) => {
  const { mutate: createAttendee } = useRegisterForEventMutation()

  const { data: attendance } = useAttendanceGetQuery(attendanceId)

  const Form = useFormBuilder({
    schema: FormSchema,
    fields: {
      attendancePoolId: createSelectInput({
        label: "Påmeldingsgruppe",
        data: attendance?.pools.map((pool) => ({
          label: pool.title,
          value: pool.id,
        })),
      }),
    },
    label: "Meld på bruker",
    onSubmit: ({ attendancePoolId }) => {
      try {
        createAttendee({ attendancePoolId, attendanceId, userId })
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

export const openCreateManualUserAttendModal = ({ userId, attendanceId }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/create",
    title: "Meld på bruker",
    innerProps: { userId, attendanceId },
  })
