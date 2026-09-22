import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { Form } from "@/components/forms/new-form/Form"
import { RichTextField } from "@/components/forms/RichTextField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { ContestWriteSchema, type ContestWrite } from "@dotkomonline/rpc/contest"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"

const RESULT_TYPE_OPTIONS = [
  { value: "SCORE", label: "Poeng" },
  { value: "DURATION", label: "Tid" },
  { value: "WINNER", label: "Vinner" },
]

const RESULT_ORDER_OPTIONS = [
  { value: "ASC", label: "Lavest vinner" },
  { value: "DESC", label: "Høyest vinner" },
]

const MIN_NAME_LENGTH = 2

export const validateContestWrite = (contest: ContestWrite): z.core.$ZodIssue[] => {
  const issues: z.core.$ZodIssue[] = []

  if (!contest.name || contest.name.length < MIN_NAME_LENGTH) {
    issues.push({
      code: "custom",
      message: `Navn må være minst ${MIN_NAME_LENGTH} tegn langt`,
      path: ["name"],
    })
  }

  return issues
}

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

interface ContestWriteFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  submitLabel?: string
  disabled?: boolean
}

export const ContestWriteForm = ({
  onSubmit,
  defaultValues = DEFAULT_VALUES,
  disabled,
  submitLabel = "Lagre",
}: ContestWriteFormProps) => {
  const { groups } = useGroupAllQuery()

  const form = useForm<FormValidationResult>({
    resolver: zodResolver(FormValidationSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="name" label="Navn" placeholder="Fadderkonkurranse 2026" required />
      <RichTextField control={form.control} name="description" label="Beskrivelse" />
      <MultiSelectField
        control={form.control}
        name="groups"
        label="Arrangørkomiteer"
        placeholder="Velg én eller flere komiteer"
        options={groups.map((group) => ({ value: group.slug, label: getGroupDisplayName(group) }))}
        required
      />
      <DateTimePickerField control={form.control} name="startDate" label="Startdato" placeholder="Start nå" />
      <SelectField
        control={form.control}
        name="resultType"
        label="Type konkurranse"
        placeholder="Velg type"
        options={RESULT_TYPE_OPTIONS}
        required
      />
      <SelectField
        control={form.control}
        name="resultOrder"
        label="Sortering"
        placeholder="Velg sortering"
        options={RESULT_ORDER_OPTIONS}
        required
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
