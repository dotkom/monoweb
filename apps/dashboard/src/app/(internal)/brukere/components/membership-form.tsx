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
import {
  getCurrentSemesterStart,
  getNextSemesterStart,
  getStudyGrade,
  getCurrentUTC,
  getPreviousSemesterStart,
  isSpringSemester,
} from "@dotkomonline/utils"
import { isBefore, roundToNearestHours } from "date-fns"
import type { z } from "zod"
import { ActionIcon, Button, Group, NumberInput, Stack } from "@mantine/core"
import { Controller } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { DatePickerInput } from "@mantine/dates"
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react"

const BACHELOR_SEMESTERS = 6
const MASTER_SEMESTER_OFFSET = BACHELOR_SEMESTERS
const MASTER_SEMESTERS = 4

export const MembershipWriteFormSchema = MembershipWriteSchema.superRefine((data, ctx) => {
  if (data.end !== null && isBefore(data.end, data.start)) {
    ctx.addIssue({
      code: "custom",
      message: "Sluttdato må være etter startdato.",
      path: ["end"],
    })
  }

  if (data.end === null && data.type !== "KNIGHT") {
    ctx.addIssue({
      code: "custom",
      message: "Sluttdato må oppgis for ikke-Ridder-medlemskap.",
      path: ["end"],
    })
  }

  if (data.end !== null && data.type === "KNIGHT") {
    ctx.addIssue({
      code: "custom",
      message: "Riddermedlemskap skal ikke ha sluttdato.",
      path: ["end"],
    })
  }

  if (data.type === "MASTER_STUDENT") {
    if (data.specialization === null) {
      ctx.addIssue({
        code: "custom",
        message: "Spesialisering må oppgis for mastermedlemskap.",
        path: ["specialization"],
      })
    }

    if (
      data.semester === null ||
      data.semester < MASTER_SEMESTER_OFFSET ||
      data.semester >= MASTER_SEMESTER_OFFSET + MASTER_SEMESTERS
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Semester må være oppgitt og minst ${MASTER_SEMESTER_OFFSET + 1} og maks ${MASTER_SEMESTER_OFFSET + MASTER_SEMESTERS} for mastermedlemskap.`,
        path: ["semester"],
      })
    }
  }

  if (data.specialization !== null && data.type !== "MASTER_STUDENT") {
    ctx.addIssue({
      code: "custom",
      message: "Spesialisering kan kun oppgis for mastermedlemskap.",
      path: ["specialization"],
    })
  }

  if (data.type === "BACHELOR_STUDENT") {
    if (data.semester === null || data.semester < 0 || data.semester >= BACHELOR_SEMESTERS) {
      ctx.addIssue({
        code: "custom",
        message: `Semester må være oppgitt og minst 1 og maks ${BACHELOR_SEMESTERS} for bachelormedlemskap.`,
        path: ["semester"],
      })
    }
  }

  if (data.type === "SOCIAL_MEMBER") {
    if (data.semester === null || data.semester < 0 || data.semester >= BACHELOR_SEMESTERS + MASTER_SEMESTERS) {
      ctx.addIssue({
        code: "custom",
        message: `Semester må være oppgitt og minst 1 og maks ${BACHELOR_SEMESTERS + MASTER_SEMESTERS} for sosialmedlemskap.`,
        path: ["semester"],
      })
    }
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
        label: "Masterspesialisering",
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
      semester: ({ state, control }) => {
        const name = "semester"
        const label = "Semester"

        return (
          <Controller
            control={control}
            name={name}
            render={({ field }) => {
              const zeroIndexedValue = field.value != null ? field.value : null
              const oneIndexedValue = zeroIndexedValue != null ? zeroIndexedValue + 1 : null
              const studyGrade = zeroIndexedValue != null ? getStudyGrade(zeroIndexedValue) : null
              const isAutumnSemester = zeroIndexedValue != null ? zeroIndexedValue % 2 === 0 : null

              return (
                <Stack gap="0.25rem">
                  <NumberInput
                    label={label}
                    description={
                      oneIndexedValue !== null && isAutumnSemester !== null && studyGrade !== null
                        ? `${oneIndexedValue}. semester innebærer ${isAutumnSemester ? "høsten" : "våren"} i ${studyGrade}. årsgang`
                        : "Ingen semesterverdi"
                    }
                    min={1}
                    max={10}
                    allowDecimal={false}
                    value={field.value !== null ? field.value + 1 : undefined}
                    onChange={(value) => {
                      const zeroIndexedValue = value !== undefined ? Number(value) - 1 : null
                      field.onChange(zeroIndexedValue)
                    }}
                    error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
                  />
                  <Button
                    w="fit-content"
                    fw="normal"
                    color="gray"
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => field.onChange(null)}
                    leftSection={<IconX size="0.85rem" />}
                    styles={{ section: { marginRight: "0.35rem" } }}
                  >
                    Fjern verdi
                  </Button>
                </Stack>
              )
            }}
          />
        )
      },
      start: ({ state, control }) => {
        const name = "start"

        return (
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Stack gap="0.25rem">
                <DatePickerInput
                  label="Startdato"
                  valueFormat="YYYY-MM-DD"
                  description={
                    field.value
                      ? isSpringSemester(field.value)
                        ? `Vår ${field.value.getFullYear()}`
                        : `Høst ${field.value.getFullYear()}`
                      : undefined
                  }
                  style={{ flexGrow: 1 }}
                  defaultValue={
                    state.defaultValues?.[name] ?? roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })
                  }
                  value={field.value}
                  onChange={field.onChange}
                  error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
                  required
                />
                <Group>
                  <Button
                    w="fit-content"
                    fw="normal"
                    color="gray"
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => field.onChange(getPreviousSemesterStart(field.value ?? getCurrentUTC()))}
                    leftSection={<IconArrowLeft size="0.85rem" />}
                    styles={{ section: { marginRight: "0.35rem" } }}
                  >
                    Forrige semester
                  </Button>
                  <Button
                    w="fit-content"
                    fw="normal"
                    color="gray"
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => field.onChange(getNextSemesterStart(field.value ?? getCurrentUTC()))}
                    leftSection={<IconArrowRight size="0.85rem" />}
                    styles={{ section: { marginRight: "0.35rem" } }}
                  >
                    Neste semester
                  </Button>
                </Group>
              </Stack>
            )}
          />
        )
      },
      end: ({ state, control }) => {
        const name = "end"

        return (
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Stack gap="0.25rem">
                <DatePickerInput
                  label="Sluttdato"
                  description={
                    field.value
                      ? isSpringSemester(field.value)
                        ? `Vår ${field.value.getFullYear()}`
                        : `Høst ${field.value.getFullYear()}`
                      : undefined
                  }
                  valueFormat="YYYY-MM-DD"
                  style={{ flexGrow: 1 }}
                  defaultValue={
                    state.defaultValues?.[name] ?? roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })
                  }
                  value={field.value}
                  onChange={field.onChange}
                  error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
                  rightSection={
                    <ActionIcon w="fit-content" color="gray" variant="subtle" onClick={() => field.onChange(null)}>
                      <IconX size="0.85rem" />
                    </ActionIcon>
                  }
                />
                <Group>
                  <Button
                    w="fit-content"
                    fw="normal"
                    color="gray"
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => field.onChange(getPreviousSemesterStart(field.value ?? getCurrentUTC()))}
                    leftSection={<IconArrowLeft size="0.85rem" />}
                    styles={{ section: { marginRight: "0.35rem" } }}
                  >
                    Forrige semester
                  </Button>
                  <Button
                    w="fit-content"
                    fw="normal"
                    color="gray"
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => field.onChange(getNextSemesterStart(field.value ?? getCurrentUTC()))}
                    leftSection={<IconArrowRight size="0.85rem" />}
                    styles={{ section: { marginRight: "0.35rem" } }}
                  >
                    Neste semester
                  </Button>
                </Group>
              </Stack>
            )}
          />
        )
      },
    },
  })
}
