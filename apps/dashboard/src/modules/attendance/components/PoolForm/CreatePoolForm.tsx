import { type AttendancePool } from "@dotkomonline/types"
import { Box, Button } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { validateAndReturn } from "./utils"
import { createLabelledCheckboxGroupInput, createNumberInput, useFormBuilder } from "../../../../app/form"
import { notifyFail } from "../../../../app/notifications"

export interface CreatePoolFormProps {
  onSubmit(values: CreatePoolFormSchema): void
  attendancePools: AttendancePool[]
  onClose(): void
  defaultValues: CreatePoolFormSchema
  mode: "create" | "update"
}

export const CreatePoolFormSchema = z.object({
  yearCriteria: z.array(z.number()),
  limit: z.number(),
})
export type CreatePoolFormSchema = z.infer<typeof CreatePoolFormSchema>

export const useCreatePoolFormLogic = (props: CreatePoolFormProps) => {
  const existingPools = [...new Set(props.attendancePools.flatMap(({ yearCriteria }) => yearCriteria))]

  const yearLabels = ["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse"]

  const Form = useFormBuilder({
    schema: CreatePoolFormSchema,
    defaultValues: props.defaultValues,
    fields: {
      yearCriteria: createLabelledCheckboxGroupInput({
        disabledOptions: existingPools,
        labels: yearLabels,
      }),
      limit: createNumberInput({
        label: "Kapasitet",
      }),
    },
    label: props.mode === "create" ? "Opprett pulje" : "Endre pulje",
    onSubmit: (values, form) => {
      form.resetField("yearCriteria")
      try {
        validateAndReturn(values.yearCriteria)
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
export const CreatePoolForm: FC<CreatePoolFormProps> = (props) => {
  const { Form } = useCreatePoolFormLogic(props)

  return (
    <Box>
      <Form />
      <Button onClick={props.onClose} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  )
}
