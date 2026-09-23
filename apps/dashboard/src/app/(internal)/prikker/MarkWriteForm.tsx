import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { Form } from "@/components/forms/Form"
import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { getGroupDisplayName, GroupSchema } from "@dotkomonline/rpc/group"
import { DEFAULT_MARK_DURATION } from "@dotkomonline/rpc/mark"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"

interface MarkWriteFormProps {
  onSubmit(data: MarkForm): void
  defaultValues?: Partial<MarkForm>
  submitLabel?: string
  suspension?: boolean
  disabled?: boolean
}

export const MarkFormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  details: z.string().min(1, "Beskrivelse er påkrevd").nullable(),
  weight: z.number().min(1).max(6, "Vekt må være mellom 1 og 6"),
  duration: z.number().min(1),
  groupIds: z.array(GroupSchema.shape.slug),
})

export type MarkForm = z.infer<typeof MarkFormSchema>

const MARK_FORM_DEFAULT_VALUES: Partial<MarkForm> = {
  title: "",
  details: "",
  weight: 3,
  duration: DEFAULT_MARK_DURATION,
}

const WEIGHT_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "Suspensjon" },
]

export const MarkWriteForm = ({
  onSubmit,
  submitLabel = "Lagre",
  defaultValues = MARK_FORM_DEFAULT_VALUES,
  suspension,
  disabled,
}: MarkWriteFormProps) => {
  // Should probably be replaced with a query for only groups user is in at some point
  // (will it though? 💀)
  // doesn't seem like it
  const { groups } = useGroupAllQuery()

  const form = useForm<MarkForm>({
    resolver: zodResolver(MarkFormSchema),
    defaultValues: {
      ...MARK_FORM_DEFAULT_VALUES,
      ...defaultValues,
    },
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="title" label="Navn" placeholder="Navn" required />
      <TextField
        control={form.control}
        name="details"
        label="Beskrivelse"
        autoComplete="mark-description"
        placeholder="Beskrivelse"
        required
      />
      {!suspension && (
        <SelectField
          control={form.control}
          name="weight"
          label="Vekt"
          placeholder="Velg vekt"
          required
          options={WEIGHT_OPTIONS}
        />
      )}
      <MultiSelectField
        control={form.control}
        name="groupIds"
        label="Ansvarlige grupper"
        required
        placeholder="Velg grupper"
        options={groups.map((group) => ({
          value: group.slug,
          label: getGroupDisplayName(group),
        }))}
      />
      <TextField
        control={form.control}
        name="duration"
        label="Varighet i dager"
        placeholder="14"
        type="number"
        required
        onChange={(event) => {
          const next = event.target.valueAsNumber
          form.setValue("duration", Number.isNaN(next) ? 0 : next, { shouldValidate: true })
        }}
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
