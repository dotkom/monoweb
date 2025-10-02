import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import {
  MembershipSpecializationSchema,
  MembershipTypeSchema,
  type MembershipWrite,
  MembershipWriteSchema,
  getMembershipTypeName,
  getSpecializationName,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addYears, isBefore } from "date-fns"
import type { z } from "zod"

export const MembershipWriteFormSchema = MembershipWriteSchema.superRefine((data, ctx) => {
  if (isBefore(data.end, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Sluttdato må være etter startdato",
      path: ["end"],
    })
  }
})

type MembershipWriteFormSchema = z.infer<typeof MembershipWriteFormSchema>

const DEFAULT_VALUES: Partial<MembershipWriteFormSchema> = {
  start: getCurrentUTC(),
  end: addYears(getCurrentUTC(), 1),
  specialization: null,
}

interface UseMembershipWriteFormProps {
  onSubmit(data: z.infer<typeof MembershipWriteFormSchema>): void
  defaultValues?: Partial<MembershipWrite>
  label?: string
}

export const useMembershipWriteForm = ({
  onSubmit,
  label = "Lagre",
  defaultValues = DEFAULT_VALUES,
}: UseMembershipWriteFormProps) => {
  return useFormBuilder({
    schema: MembershipWriteFormSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      type: createSelectInput({
        label: "Type",
        required: true,
        placeholder: "Velg type",
        data: Object.values(MembershipTypeSchema._zod.values).map((type) => ({
          value: type,
          label: getMembershipTypeName(type) ?? type,
        })),
      }),
      specialization: createSelectInput({
        label: "Spesialisering",
        required: false,
        clearable: true,
        placeholder: "Velg spesialisering",
        data: Object.values(MembershipSpecializationSchema._zod.values)
          .filter((specialization) => specialization !== "UNKNOWN")
          .map((specialization) => ({
            value: specialization,
            label: getSpecializationName(specialization) ?? specialization,
          })),
      }),
      start: createDateTimeInput({
        label: "Startdato",
        required: true,
      }),
      end: createDateTimeInput({
        label: "Sluttdato",
        required: true,
      }),
    },
  })
}
