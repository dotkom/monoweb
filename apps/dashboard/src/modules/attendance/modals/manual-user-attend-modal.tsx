import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"
import { createSelectInput, useFormBuilder } from "../../../app/form"
import { notifyFail } from "../../../app/notifications"
import { useRegisterForEventMutation } from "../mutations/use-attendee-mutations"
import { usePoolsGetQuery } from "../queries/use-get-queries"

interface ModalProps {
  userId: string
  attendanceId: string
}

const FormSchema = z.object({
  poolId: z.string(),
})

export const CreateManualUserAttendModal: FC<ContextModalProps<ModalProps>> = ({ context, id, innerProps }) => {
  const { mutate: createAttendee } = useRegisterForEventMutation()

  const { pools } = usePoolsGetQuery(innerProps.attendanceId)

  const onSubmit = (userId: string, attendancePoolId: string) => {
    createAttendee({
      attendancePoolId: attendancePoolId,
      userId: userId,
    })
  }

  const Form = useFormBuilder({
    schema: FormSchema,
    fields: {
      poolId: createSelectInput({
        label: "Påmeldingsgruppe",
        data: pools.map((pool) => ({
          label: pool.title,
          value: pool.id,
        })),
      }),
    },
    label: "Meld på bruker",
    onSubmit: (values) => {
      try {
        onSubmit(innerProps.userId, values.poolId)
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
