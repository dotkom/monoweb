import { AttendanceWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { createDateTimeInput, useFormBuilder } from "../../../form"

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

  return true
})

interface AttendanceFormProps {
  onSubmit(values: z.infer<typeof AttendanceFormSchema>): void
  defaultValues?: z.infer<typeof AttendanceFormSchema>
  label: string
}

export const useAttendanceForm = ({ onSubmit, defaultValues, label }: AttendanceFormProps) =>
  useFormBuilder({
    schema: AttendanceFormSchema,
    defaultValues,
    onSubmit, // Directly use the onSubmit prop
    label,
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
