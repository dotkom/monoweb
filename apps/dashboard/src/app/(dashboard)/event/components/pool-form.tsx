import { Box } from "@mantine/core"
import type { FC } from "react"
import { z } from "zod"
import { createLabelledCheckboxGroupInput, createNumberInput, createTextInput, useFormBuilder } from "../../../form"
import { notifyFail } from "../../../notifications"

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
  const yearEntries = [
    { label: "1. klasse", key: 1 },
    { label: "2. klasse", key: 2 },
    { label: "3. klasse", key: 3 },
    { label: "4. klasse", key: 4 },
    { label: "5. klasse", key: 5 },
  ]

  const Form = useFormBuilder({
    schema: PoolFormSchema,
    defaultValues: props.defaultValues,
    fields: {
      yearCriteria: createLabelledCheckboxGroupInput({
        disabledOptions: props.disabledYears,
        entries: yearEntries,
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
    </Box>
  )
}
