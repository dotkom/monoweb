import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { AttendanceWriteSchema } from "@dotkomonline/rpc/attendance"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { Stack, Text } from "@mantine/core"
import { useWatch } from "react-hook-form"
import type { z } from "zod"
import { formatEventScheduleDate, formatRegistrationDuration, formatRelativeToEventStart } from "./attendance-dates"

// Define the schema without the omitted fields
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

interface AttendanceFormProps {
  onSubmit(values: AttendanceFormValues): void
  defaultValues?: AttendanceFormValues
  label: string
  disabled?: boolean
  eventStart: Date
}

export const useAttendanceForm = ({ onSubmit, defaultValues, label, disabled, eventStart }: AttendanceFormProps) =>
  useFormBuilder({
    schema: AttendanceFormSchema,
    defaultValues,
    onSubmit,
    label,
    disabled,
    fields: {
      registerStart: createDateTimeInput({
        label: "Påmeldingsstart",
        syncOffsetTo: "registerEnd",
        description: <RelativeToEventStartDescription name="registerStart" eventStart={eventStart} />,
      }),
      registerEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
        description: <RegisterEndDescription eventStart={eventStart} />,
      }),
      deregisterDeadline: createDateTimeInput({
        label: "Avmeldingsfrist",
        description: <RelativeToEventStartDescription name="deregisterDeadline" eventStart={eventStart} />,
      }),
    },
  })

interface EventScheduleSummaryProps {
  eventStart: Date
  eventEnd: Date
}

export function EventScheduleSummary({ eventStart, eventEnd }: EventScheduleSummaryProps) {
  return (
    <Stack gap={2}>
      <Text size="sm" c="dimmed">
        Arrangementstart: {formatEventScheduleDate(eventStart)}
      </Text>
      <Text size="sm" c="dimmed">
        Arrangementslutt: {formatEventScheduleDate(eventEnd)}
      </Text>
    </Stack>
  )
}

function RelativeToEventStartDescription({
  name,
  eventStart,
}: {
  name: "registerStart" | "registerEnd" | "deregisterDeadline"
  eventStart: Date
}) {
  const date = useWatch<AttendanceFormValues, typeof name>({ name })
  const helperText = formatRelativeToEventStart(date, eventStart)

  if (helperText === null) {
    return null
  }

  return capitalizeFirstLetter(helperText)
}

function RegisterEndDescription({ eventStart }: { eventStart: Date }) {
  const registerStart = useWatch<AttendanceFormValues, "registerStart">({ name: "registerStart" })
  const registerEnd = useWatch<AttendanceFormValues, "registerEnd">({ name: "registerEnd" })
  const relativeToEventStart = formatRelativeToEventStart(registerEnd, eventStart)
  const registrationDuration = formatRegistrationDuration(registerStart, registerEnd)

  if (relativeToEventStart === null) {
    if (registrationDuration === null) {
      return null
    }

    return capitalizeFirstLetter(registrationDuration)
  }

  if (registrationDuration === null) {
    return capitalizeFirstLetter(relativeToEventStart)
  }

  return (
    <>
      {capitalizeFirstLetter(relativeToEventStart)}
      <br />
      {capitalizeFirstLetter(registrationDuration)}
    </>
  )
}
