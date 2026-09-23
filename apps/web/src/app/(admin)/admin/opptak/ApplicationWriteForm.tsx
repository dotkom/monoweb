import { useGroupAllQuery } from "@admin/grupper/queries"
import { CheckboxField } from "@admin/components/forms/CheckboxField"
import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { MultiSelectField } from "@admin/components/forms/MultiSelectField"
import { TextField } from "@admin/components/forms/TextField"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { ApplicationPeriodFormSchema, validateApplicationPeriodWrite } from "./validation"

const FormValidationSchema = ApplicationPeriodFormSchema.superRefine((data, ctx) => {
  const issues = validateApplicationPeriodWrite(data)
  for (const issue of issues) {
    ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const DEFAULT_VALUES: FormValidationResult = {
  name: "",
  applicationsOpenAt: null,
  applicationsCloseAt: null,
  interviewsStartDate: null,
  interviewsEndDate: null,
  isDraft: true,
  isEnabled: true,
  committeeGroups: [],
  nodeAndAssociatedGroups: [],
}

interface ApplicationWriteFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  submitLabel?: string
  disabled?: boolean
}

export const ApplicationWriteForm = ({
  onSubmit,
  defaultValues = {},
  disabled,
  submitLabel = "Lagre",
}: ApplicationWriteFormProps) => {
  const { groups } = useGroupAllQuery()

  const form = useForm<FormValidationResult>({
    resolver: zodResolver(FormValidationSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
    disabled,
  })

  const committeeOptions = useMemo(
    () =>
      groups
        .filter((group) => group.type === "COMMITTEE")
        .map((group) => ({ value: group.slug, label: getGroupDisplayName(group) })),
    [groups]
  )

  const nodeAndAssociatedOptions = useMemo(
    () =>
      groups
        .filter((group) => group.type === "NODE_COMMITTEE" || group.type === "ASSOCIATED")
        .map((group) => ({ value: group.slug, label: getGroupDisplayName(group) })),
    [groups]
  )

  const hasPreselectedCommittees = useRef(defaultValues.committeeGroups !== undefined)

  useEffect(() => {
    if (hasPreselectedCommittees.current || committeeOptions.length === 0) {
      return
    }

    hasPreselectedCommittees.current = true
    form.setValue(
      "committeeGroups",
      committeeOptions.map((option) => option.value)
    )
  }, [committeeOptions, form])

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="name" label="Navn" placeholder="Opptak 2026" required />

      <DateTimePickerField
        control={form.control}
        name="applicationsOpenAt"
        label="Søknadsstart"
        description="Når søknadsskjemaet åpner."
        placeholder="Velg søknadsstart"
        syncOffsetTo="applicationsCloseAt"
        required
      />
      <DateTimePickerField
        control={form.control}
        name="applicationsCloseAt"
        label="Søknadsslutt"
        description="Når søknadsskjemaet stenger."
        placeholder="Velg søknadsslutt"
        required
      />

      <DateTimePickerField
        control={form.control}
        name="interviewsStartDate"
        label="Intervjustart"
        description="Første dagen det kan settes opp intervjuer."
        placeholder="Velg intervjustart"
        syncOffsetTo="interviewsEndDate"
        required
      />
      <DateTimePickerField
        control={form.control}
        name="interviewsEndDate"
        label="Intervjuslutt"
        description="Siste dagen det kan settes opp intervjuer."
        placeholder="Velg intervjuslutt"
        required
      />

      <MultiSelectField
        control={form.control}
        name="committeeGroups"
        label="Komitéer"
        description="Komitéer som deltar i opptaket. Alle komitéer er valgt som standard."
        placeholder="Velg komitéer"
        options={committeeOptions}
        required
      />

      <MultiSelectField
        control={form.control}
        name="nodeAndAssociatedGroups"
        label="Nodekomitéer og assosierte grupper"
        description="Nodekomitéer og assosierte grupper som deltar i opptaket."
        placeholder="Velg nodekomitéer og assosierte grupper"
        options={nodeAndAssociatedOptions}
      />

      <CheckboxField
        control={form.control}
        name="isDraft"
        label="Utkast"
        description="Utkast er ikke synlige for søkere."
      />

      <CheckboxField
        control={form.control}
        name="isEnabled"
        label="Aktivt"
        description="Inaktive opptak tar ikke imot nye søknader. Dette har ingen effekt på utkast."
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
