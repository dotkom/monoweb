"use client"

import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { Form } from "@/components/forms/new-form/Form"
import { AttendanceWriteSchema } from "@dotkomonline/rpc/attendance"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { Button, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, type Control } from "react-hook-form"
import type { z } from "zod"
import { formatEventScheduleDate, formatRegistrationDuration, formatRelativeToEventStart } from "./attendance-dates"

const AttendanceFormSchema = AttendanceWriteSchema.superRefine((val, ctx) => {
  if (val.registerStart > val.registerEnd) {
    const message = "Påmeldingsstart må være før påmeldingsslutt"
    const code = "custom"
    ctx.addIssue({ message, code, path: ["registerEnd"] })
  }

  if (val.registerStart > val.deregisterDeadline) {
    const message = "Påmeldingsstart må være før frist avmelding"
    const code = "custom"
    ctx.addIssue({ message, code, path: ["deregisterDeadline"] })
  }
})

type AttendanceFormValues = z.infer<typeof AttendanceFormSchema>

interface AttendanceWriteFormProps {
  onSubmit(values: AttendanceFormValues): void
  defaultValues?: AttendanceFormValues
  submitLabel: string
  disabled?: boolean
  eventStart: Date
}

export function AttendanceWriteForm({
  onSubmit,
  defaultValues,
  submitLabel,
  disabled,
  eventStart,
}: AttendanceWriteFormProps) {
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(AttendanceFormSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div>
        <DateTimePickerField
          control={form.control}
          name="registerStart"
          label="Påmeldingsstart"
          syncOffsetTo="registerEnd"
        />
        <RelativeToEventStartHint control={form.control} name="registerStart" eventStart={eventStart} />
      </div>
      <div>
        <DateTimePickerField control={form.control} name="registerEnd" label="Påmeldingsslutt" />
        <RegisterEndHint control={form.control} eventStart={eventStart} />
      </div>
      <div>
        <DateTimePickerField control={form.control} name="deregisterDeadline" label="Avmeldingsfrist" />
        <RelativeToEventStartHint control={form.control} name="deregisterDeadline" eventStart={eventStart} />
      </div>
      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}

interface EventScheduleSummaryProps {
  eventStart: Date
  eventEnd: Date
}

export function EventScheduleSummary({ eventStart, eventEnd }: EventScheduleSummaryProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text className="text-sm text-muted-foreground">Arrangementstart: {formatEventScheduleDate(eventStart)}</Text>
      <Text className="text-sm text-muted-foreground">Arrangementslutt: {formatEventScheduleDate(eventEnd)}</Text>
    </div>
  )
}

function RelativeToEventStartHint({
  name,
  eventStart,
  control,
}: {
  name: "registerStart" | "registerEnd" | "deregisterDeadline"
  eventStart: Date
  control: Control<AttendanceFormValues>
}) {
  const date = useWatch<AttendanceFormValues, typeof name>({ control, name })
  const helperText = formatRelativeToEventStart(date, eventStart)

  if (helperText === null) {
    return null
  }

  return <Text className="text-sm text-muted-foreground">{capitalizeFirstLetter(helperText)}</Text>
}

function RegisterEndHint({ eventStart, control }: { eventStart: Date; control: Control<AttendanceFormValues> }) {
  const registerStart = useWatch<AttendanceFormValues, "registerStart">({ control, name: "registerStart" })
  const registerEnd = useWatch<AttendanceFormValues, "registerEnd">({ control, name: "registerEnd" })
  const relativeToEventStart = formatRelativeToEventStart(registerEnd, eventStart)
  const registrationDuration = formatRegistrationDuration(registerStart, registerEnd)

  if (relativeToEventStart === null && registrationDuration === null) {
    return null
  }

  if (relativeToEventStart === null && registrationDuration !== null) {
    return <Text className="text-sm text-muted-foreground">{capitalizeFirstLetter(registrationDuration)}</Text>
  }

  if (registrationDuration === null && relativeToEventStart !== null) {
    return <Text className="text-sm text-muted-foreground">{capitalizeFirstLetter(relativeToEventStart)}</Text>
  }

  return (
    <Text className="text-sm text-muted-foreground">
      {capitalizeFirstLetter(relativeToEventStart ?? "")}
      <br />
      {capitalizeFirstLetter(registrationDuration ?? "")}
    </Text>
  )
}
