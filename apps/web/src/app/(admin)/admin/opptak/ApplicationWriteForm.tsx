import { CheckboxField } from "@admin/components/forms/CheckboxField"
import { DateTimePickerField } from "@admin/components/forms/DateTimePickerField"
import { Form } from "@admin/components/forms/Form"
import { TextField } from "@admin/components/forms/TextField"
import { TimeField } from "@admin/components/forms/TimeField"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ApplicationPeriodWriteSchema, formatMinutesOfDay } from "./opptak"

const MIN_NAME_LENGTH = 2
const DEFAULT_DAY_START_MINUTES = 480
const DEFAULT_DAY_END_MINUTES = 1320
const DEFAULT_SLOT_LENGTH_MINUTES = 10

const ApplicationPeriodFormSchema = ApplicationPeriodWriteSchema.extend({
  applicationsStart: z.date().nullable(),
  applicationsEnd: z.date().nullable(),
  interviewStartDate: z.date().nullable(),
  interviewEndDate: z.date().nullable(),
})

type ApplicationPeriodForm = z.infer<typeof ApplicationPeriodFormSchema>

export const validateApplicationPeriodWrite = (period: ApplicationPeriodForm): z.core.$ZodIssue[] => {
  const issues: z.core.$ZodIssue[] = []

  if (!period.name || period.name.length < MIN_NAME_LENGTH) {
    issues.push({
      code: "custom",
      message: `Navn må være minst ${MIN_NAME_LENGTH} tegn langt`,
      path: ["name"],
    })
  }

  const requiredDates = [
    { value: period.applicationsStart, path: "applicationsStart", label: "Søknadsstart" },
    { value: period.applicationsEnd, path: "applicationsEnd", label: "Søknadsslutt" },
    { value: period.interviewStartDate, path: "interviewStartDate", label: "Intervjustart" },
    { value: period.interviewEndDate, path: "interviewEndDate", label: "Intervjuslutt" },
  ] as const

  for (const { value, path, label } of requiredDates) {
    if (value === null) {
      issues.push({ code: "custom", message: `${label} må velges`, path: [path] })
    }
  }

  if (
    period.applicationsStart !== null &&
    period.applicationsEnd !== null &&
    period.applicationsEnd <= period.applicationsStart
  ) {
    issues.push({ code: "custom", message: "Søknadsslutt må være etter søknadsstart", path: ["applicationsEnd"] })
  }

  if (
    period.interviewStartDate !== null &&
    period.interviewEndDate !== null &&
    period.interviewEndDate <= period.interviewStartDate
  ) {
    issues.push({ code: "custom", message: "Intervjuslutt må være etter intervjustart", path: ["interviewEndDate"] })
  }

  if (
    period.applicationsEnd !== null &&
    period.interviewStartDate !== null &&
    period.interviewStartDate < period.applicationsEnd
  ) {
    issues.push({
      code: "custom",
      message: "Intervjuene kan ikke starte før søknadsfristen",
      path: ["interviewStartDate"],
    })
  }

  if (period.dayEndMinutes <= period.dayStartMinutes) {
    issues.push({
      code: "custom",
      message: "Intervjudagen må slutte etter at den starter",
      path: ["dayEndMinutes"],
    })
  }

  if (period.slotLengthMinutes > period.dayEndMinutes - period.dayStartMinutes) {
    issues.push({
      code: "custom",
      message: "Intervjublokken får ikke plass innenfor intervjudagen",
      path: ["slotLengthMinutes"],
    })
  }

  return issues
}

const FormValidationSchema = ApplicationPeriodFormSchema.superRefine((data, ctx) => {
  const issues = validateApplicationPeriodWrite(data)
  for (const issue of issues) {
    ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
  }
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

const DEFAULT_VALUES: FormValidationResult = {
  name: "",
  applicationsStart: null,
  applicationsEnd: null,
  interviewStartDate: null,
  interviewEndDate: null,
  dayStartMinutes: DEFAULT_DAY_START_MINUTES,
  dayEndMinutes: DEFAULT_DAY_END_MINUTES,
  slotLengthMinutes: DEFAULT_SLOT_LENGTH_MINUTES,
  isDraft: true,
  isLocked: false,
}

interface ApplicationWriteFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  submitLabel?: string
  disabled?: boolean
}

export const ApplicationWriteForm = ({
  onSubmit,
  defaultValues = DEFAULT_VALUES,
  disabled,
  submitLabel = "Lagre",
}: ApplicationWriteFormProps) => {
  const form = useForm<FormValidationResult>({
    resolver: zodResolver(FormValidationSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
    disabled,
  })

  const dayStartMinutes = form.watch("dayStartMinutes")
  const dayEndMinutes = form.watch("dayEndMinutes")

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="name" label="Navn" placeholder="Opptak 2026" required />

      <DateTimePickerField
        control={form.control}
        name="applicationsStart"
        label="Søknadsstart"
        description="Når søknadsskjemaet åpner."
        placeholder="Velg søknadsstart"
        syncOffsetTo="applicationsEnd"
        required
      />
      <DateTimePickerField
        control={form.control}
        name="applicationsEnd"
        label="Søknadsslutt"
        description="Når søknadsskjemaet stenger."
        placeholder="Velg søknadsslutt"
        required
      />

      <DateTimePickerField
        control={form.control}
        name="interviewStartDate"
        label="Intervjustart"
        description="Første dagen det kan settes opp intervjuer."
        placeholder="Velg intervjustart"
        syncOffsetTo="interviewEndDate"
        required
      />
      <DateTimePickerField
        control={form.control}
        name="interviewEndDate"
        label="Intervjuslutt"
        description="Siste dagen det kan settes opp intervjuer."
        placeholder="Velg intervjuslutt"
        required
      />

      <TimeField
        control={form.control}
        name="dayStartMinutes"
        label="Intervjudagen starter"
        description="Tidligste tidspunkt intervjuer kan legges på en dag."
        valueAs="minutes"
        minuteStep={15}
        required
      />
      <TimeField
        control={form.control}
        name="dayEndMinutes"
        label="Intervjudagen slutter"
        description="Seneste tidspunkt intervjuer kan legges på en dag."
        valueAs="minutes"
        minuteStep={15}
        required
      />

      <TextField
        control={form.control}
        name="slotLengthMinutes"
        label="Lengde på intervjublokk"
        description={`Kalenderen viser ${formatMinutesOfDay(dayStartMinutes)}–${formatMinutesOfDay(dayEndMinutes)} delt inn i blokker av denne lengden. Grupper kan bruke flere blokker per intervju.`}
        placeholder={String(DEFAULT_SLOT_LENGTH_MINUTES)}
        type="number"
        min={1}
        required
        onChange={(event) => {
          const next = event.target.valueAsNumber
          form.setValue("slotLengthMinutes", Number.isNaN(next) ? 0 : next, { shouldValidate: true })
        }}
      />

      <CheckboxField
        control={form.control}
        name="isDraft"
        label="Utkast"
        description="Utkast er ikke synlige for søkere."
      />

      <CheckboxField
        control={form.control}
        name="isLocked"
        label="Stanset"
        description="Stansede opptak tar ikke imot nye søknader."
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
