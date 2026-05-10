import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { ContestWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { validateContestWrite } from "../validation"

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
    ctx.addIssue(issue)
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const DEFAULT_VALUES: FormValidationResult = {
  name: "",
  description: null,
  startDate: null,
  resultType: "SCORE",
  resultOrder: "DESC",
  groupId: "",
}

interface UseContestWriteFormProps {
  onSubmit(data: FormValidationResult): void
}

export const useContestWriteForm = ({ onSubmit }: UseContestWriteFormProps) => {
  const { groups } = useGroupAllQuery()

  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: DEFAULT_VALUES,
    onSubmit,
    label: "Opprett konkurranse",
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Fadderkonkurranse 2026",
        withAsterisk: true,
      }),
      description: createTextInput({
        label: "Beskrivelse",
        placeholder: "Kort beskrivelse (valgfri)",
      }),
      groupId: createSelectInput({
        label: "Komite",
        placeholder: "Velg komite",
        data: groups.map((g) => ({ value: g.slug, label: g.abbreviation })),
        searchable: true,
        withAsterisk: true,
      }),
      startDate: createDateTimeInput({
        label: "Startdato",
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
