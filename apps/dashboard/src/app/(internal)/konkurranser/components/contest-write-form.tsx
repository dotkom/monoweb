import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { ContestWriteSchema } from "@dotkomonline/rpc/contest"
import type { z } from "zod"
import { validateContestWrite } from "../validation"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"

const RESULT_TYPE_OPTIONS = [
  { value: "SCORE", label: "Poeng" },
  { value: "DURATION", label: "Tid" },
  { value: "WINNER", label: "Vinner" },
]

const RESULT_ORDER_OPTIONS = [
  { value: "ASC", label: "Lavest vinner" },
  { value: "DESC", label: "Høyest vinner" },
]

const FormValidationSchema = ContestWriteSchema.superRefine((data, ctx) => {
  const issues = validateContestWrite(data)
  for (const issue of issues) {
    ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const DEFAULT_VALUES: FormValidationResult = {
  name: "",
  description: null,
  startDate: null,
  resultType: "SCORE",
  resultOrder: "DESC",
  groups: [],
}

interface UseContestWriteFormProps {
  onSubmit(data: FormValidationResult): void
  disabled?: boolean
}

export const useContestWriteForm = ({ onSubmit, disabled }: UseContestWriteFormProps) => {
  const { groups } = useGroupAllQuery()

  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: DEFAULT_VALUES,
    onSubmit,
    label: "Opprett konkurranse",
    disabled,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Fadderkonkurranse 2026",
        withAsterisk: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: false,
      }),
      groups: createMultipleSelectInput({
        label: "Arrangørkomiteer",
        placeholder: "Velg én eller flere komiteer",
        data: groups.map((g) => ({ value: g.slug, label: g.abbreviation })),
        searchable: true,
        required: true,
        withAsterisk: true,
      }),
      startDate: createDateTimeInput({
        label: "Startdato",
        placeholder: "Start nå",
      }),
      resultType: createSelectInput({
        label: "Type konkurranse",
        placeholder: "Velg type",
        data: RESULT_TYPE_OPTIONS,
        withAsterisk: true,
      }),
      resultOrder: createSelectInput({
        label: "Sortering",
        placeholder: "Velg sortering",
        data: RESULT_ORDER_OPTIONS,
        withAsterisk: true,
      }),
    },
  })
}
