import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { AttendanceWriteSchema } from "@dotkomonline/rpc/attendance"
import type { z } from "zod"

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

interface AttendanceFormProps {
  onSubmit(values: z.infer<typeof AttendanceFormSchema>): void
  defaultValues?: z.infer<typeof AttendanceFormSchema>
  label: string
  disabled?: boolean
}

export const useAttendanceForm = ({ onSubmit, defaultValues, label, disabled }: AttendanceFormProps) =>
  useFormBuilder({
    schema: AttendanceFormSchema,
    defaultValues,
    onSubmit,
    label,
    disabled,
    fields: {
      registerStart: createDateTimeInput({
        label: "Påmeldingsstart",
      }),
      deregisterDeadline: createDateTimeInput({
        label: "Frist avmelding",
      }),
      registerEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
      }),
    },
  })
