import { type AttendancePool } from "@dotkomonline/types"
import { Box, Button } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import {
  createLabelledCheckboxGroupInput,
  createNumberInput,
  createTextInput,
  useFormBuilder,
} from "../../../../app/form"
import { notifyFail } from "../../../../app/notifications"

export interface PoolFormProps {
  onSubmit(values: PoolFormSchema): void
  disabledYears: number[]
  onClose(): void
  defaultValues: PoolFormSchema
  mode: "create" | "update"
}

export const PoolFormSchema = z.object({
  yearCriteria: z.array(z.number()).min(1, "Du må velge minst ett klassetrinn!"),
  capacity: z.number(),
  title: z.string().min(1),
})
export type PoolFormSchema = z.infer<typeof PoolFormSchema>

export const usePoolForm = (props: PoolFormProps) => {
  const yearLabels = ["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse", "PHD"]

  const Form = useFormBuilder({
    schema: PoolFormSchema,
    defaultValues: props.defaultValues,
    fields: {
      yearCriteria: createLabelledCheckboxGroupInput({
        disabledOptions: props.disabledYears,
        labels: yearLabels,
      }),
      title: createTextInput({
        label: "Tittel",
      }),
      capacity: createNumberInput({
        label: "Kapasitet",
      }),
    },
    label: props.mode === "create" ? "Opprett påmeldingsgruppe" : "Endre påmeldingsgruppe",
    onSubmit: (values, form) => {
      form.resetField("yearCriteria")
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
export const PoolForm: FC<PoolFormProps> = (props) => {
  const { Form } = usePoolForm(props)

  return (
    <Box>
      <Form />
      <Button onClick={props.onClose} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  )
}
