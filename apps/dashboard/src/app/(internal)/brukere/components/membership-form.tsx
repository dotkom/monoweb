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
  getNextSemesterStart,
  getCurrentSemesterStart,
} from "@dotkomonline/types"
import { isBefore } from "date-fns"
import type { z } from "zod"
import { createNumberInput } from "@/components/forms/NumberInput"
import { Code, Stack, Text } from "@mantine/core"

export const MembershipWriteFormSchema = MembershipWriteSchema.superRefine((data, ctx) => {
  if (data.end && isBefore(data.end, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Sluttdato må være etter startdato",
      path: ["end"],
    })
  }
})

type MembershipWriteFormSchema = z.infer<typeof MembershipWriteFormSchema>

const DEFAULT_VALUES: Partial<MembershipWriteFormSchema> = {
  start: getCurrentSemesterStart(),
  end: getNextSemesterStart(),
  specialization: null,
  semester: 0,
}

interface UseMembershipWriteFormProps {
  onSubmit(data: MembershipWriteFormSchema): void
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
        data: Object.values(MembershipTypeSchema.Values).map((type) => ({
          value: type,
          label: getMembershipTypeName(type) ?? type,
        })),
      }),
      specialization: createSelectInput({
        label: "Spesialisering",
        description: "Masterspesialisering",
        required: false,
        clearable: true,
        placeholder: "Velg spesialisering",
        data: Object.values(MembershipSpecializationSchema.Values)
          .filter((specialization) => specialization !== "UNKNOWN")
          .map((specialization) => ({
            value: specialization,
            label: getSpecializationName(specialization) ?? specialization,
          })),
        disabled: false,
      }),
      start: createDateTimeInput({
        label: "Startdato",
        required: true,
      }),
      end: createDateTimeInput({
        label: "Sluttdato",
        required: true,
      }),
      semester: createNumberInput({
        label: "Semester",
        description: (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Hvilket semester medlemskapet innebærer. 0-indeksert.
            </Text>
            <Stack gap="0.25rem">
              <Text size="xs" c="dimmed">
                <Code>0</Code> → 1. semester (1. årstrinn)
              </Text>
              <Text size="xs" c="dimmed">
                <Code>1</Code> → 2. semester (1. årstrinn)
              </Text>
              <Text size="xs" c="dimmed">
                <Code>2</Code> → 3. semester (2. årstrinn)
              </Text>
              <Text size="xs" c="dimmed">
                ...
              </Text>
              <Text size="xs" c="dimmed">
                <Code>8</Code> → 9. semester (5. årstrinn)
              </Text>
              <Text size="xs" c="dimmed">
                <Code>9</Code> → 10. semester (5. årstrinn)
              </Text>
            </Stack>
          </Stack>
        ),
        required: false,
        min: 0,
        max: 9,
        allowDecimal: false,
      }),
    },
  })
}
