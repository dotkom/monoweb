import { type AttendancePool } from "@dotkomonline/types"
import { Box, Button } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { createNumberInput, useFormBuilder } from "../../../../app/form"
import { notifyFail } from "../../../../app/notifications"

export interface UpdatePoolFormProps {
  onSubmit(values: UpdatePoolFormSchema): void
  attendancePools: AttendancePool[]
  onClose(): void
  defaultValues: UpdatePoolFormSchema
}

export const UpdatePoolFormSchema = z.object({
  limit: z.number(),
})
export type UpdatePoolFormSchema = z.infer<typeof UpdatePoolFormSchema>

export const useUpdatePoolFormLogic = (props: UpdatePoolFormProps) => {
  const Form = useFormBuilder({
    schema: UpdatePoolFormSchema,
    defaultValues: props.defaultValues,
    fields: {
      limit: createNumberInput({
        label: "Kapasitet",
      }),
    },
    label: "Endre pulje",
    onSubmit: (values) => {
      try {
        props.onSubmit(values)
      } catch (e) {
        notifyFail({
          title: "Oops!",
          message: (e as Error).message,
        })
      }
    },
  })

  return { Form }
}
export const UpdatePoolForm: FC<UpdatePoolFormProps> = (props) => {
  const { Form } = useUpdatePoolFormLogic(props)

  return (
    <Box>
      <Form />
      <Button onClick={props.onClose} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  )
}
