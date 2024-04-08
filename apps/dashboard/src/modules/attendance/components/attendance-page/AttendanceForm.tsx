import { AttendanceSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { createDateTimeInput, useFormBuilder } from "../../../../app/form"

// Define the schema without the omitted fields
const AttendanceFormSchema = AttendanceSchema.omit({
  eventId: true,
  id: true,
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
      registerEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
      }),
      deregisterDeadline: createDateTimeInput({
        label: "Frist avmelding",
      }),
    },
  })

export default useAttendanceForm
