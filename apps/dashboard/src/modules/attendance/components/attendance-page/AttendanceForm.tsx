import { AttendanceSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { createDateTimeInput, useFormBuilder } from "../../../../app/form"

// Define the schema without the omitted fields
const AttendanceFormSchema = AttendanceSchema.omit({
  eventId: true,
  id: true,
}).superRefine((val, ctx) => {
  // Check that the registerStart is before the registerEnd
  if (!(val.registerStart <= val.deregisterDeadline && val.deregisterDeadline <= val.registerEnd)) {
    const message = "Påmeldingsstart < Frist avmelding < Påmeldingsslutt"
    const code = "custom"
    ctx.addIssue({ message, code, path: ["registerStart"] })
    ctx.addIssue({ message, code, path: ["registerEnd"] })
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

export default useAttendanceForm
