"use client"

import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "@/components/forms/FieldShell"
import { Form } from "@/components/forms/Form"
import { SelectField } from "@/components/forms/SelectField"
import {
  getMembershipTypeName,
  getSpecializationName,
  MembershipSpecializationSchema,
  MembershipTypeSchema,
  MembershipWriteSchema,
  type MembershipWrite,
} from "@dotkomonline/rpc/user"
import { Button, Text } from "@dotkomonline/ui"
import {
  getCurrentSemesterStart,
  getCurrentUTC,
  getNextSemesterStart,
  getPreviousSemesterStart,
  getStudyGrade,
  isSpringSemester,
} from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react"
import { isBefore } from "date-fns"
import { useController, useForm, useFormContext, useWatch, type Control } from "react-hook-form"
import type z from "zod"

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

type FormInput = z.input<typeof MembershipWriteFormSchema>
type FormValues = z.output<typeof MembershipWriteFormSchema>
type SpecializationValue = NonNullable<FormValues["specialization"]>

const DEFAULT_VALUES: Partial<FormInput> = {
  start: getCurrentSemesterStart(),
  end: getNextSemesterStart(),
  specialization: null,
  semester: 0,
}

const typeOptions = Object.values(MembershipTypeSchema.enum).map((type) => ({
  value: type,
  label: getMembershipTypeName(type) ?? type,
}))

const specializationOptions = Object.values(MembershipSpecializationSchema.enum)
  .filter((specialization) => specialization !== "UNKNOWN")
  .map((specialization) => ({
    value: specialization,
    label: getSpecializationName(specialization) ?? specialization,
  }))

interface MembershipWriteFormProps {
  onSubmit(data: FormValues): void
  defaultValues?: Partial<MembershipWrite>
  submitLabel?: string
}

export function MembershipWriteForm({
  onSubmit,
  submitLabel = "Lagre",
  defaultValues = DEFAULT_VALUES,
}: MembershipWriteFormProps) {
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(MembershipWriteFormSchema),
    defaultValues,
  })

  const resolvedForm = form as import("react-hook-form").UseFormReturn<FormValues>
  const { control } = resolvedForm
  const membershipType = useWatch({ control, name: "type" })

  return (
    <Form form={resolvedForm} onSubmit={onSubmit}>
      <Text className="text-sm text-muted-foreground">Rediger semesterverdien for å endre årstrinn.</Text>

      <SelectField control={control} name="type" label="Type" placeholder="Velg type" options={typeOptions} required />

      <SelectField<FormValues, SpecializationValue>
        control={control}
        name="specialization"
        label="Masterspesialisering"
        placeholder="Velg spesialisering"
        options={specializationOptions}
        disabled={membershipType !== "MASTER_STUDENT"}
      />

      <SemesterField control={control} disabled={form.formState.disabled} />

      <MembershipDateField
        control={control}
        name="start"
        label="Startdato"
        required
        disabled={form.formState.disabled}
      />

      <MembershipDateField
        control={control}
        name="end"
        label="Sluttdato"
        clearable
        disabled={form.formState.disabled}
      />

      <Button type="submit" variant="default" className="w-fit">
        {submitLabel}
      </Button>
    </Form>
  )
}

function SemesterField({ control, disabled }: { control: Control<FormValues>; disabled?: boolean }) {
  const { field, fieldState } = useController({ control, name: "semester" })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const id = "semester"

  const zeroIndexedValue = field.value != null ? field.value : null
  const oneIndexedValue = zeroIndexedValue != null ? zeroIndexedValue + 1 : null
  const studyGrade = zeroIndexedValue != null ? getStudyGrade(zeroIndexedValue) : null
  const isAutumnSemester = zeroIndexedValue != null ? zeroIndexedValue % 2 === 0 : null

  const description =
    oneIndexedValue !== null && isAutumnSemester !== null && studyGrade !== null
      ? `${oneIndexedValue}. semester innebærer ${isAutumnSemester ? "høsten" : "våren"} i ${studyGrade}. årsgang`
      : "Ingen semesterverdi"

  return (
    <FieldShell id={id} label="Semester" description={description} error={error} required>
      <div className="flex flex-col gap-2">
        <input
          id={id}
          type="number"
          min={1}
          max={10}
          disabled={combineFieldDisabled(disabled, field.disabled)}
          className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={field.value !== null && field.value !== undefined ? field.value + 1 : ""}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === "") {
              field.onChange(null)
              return
            }

            const zeroIndexed = Number(raw) - 1
            field.onChange(zeroIndexed)
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          disabled={disabled}
          icon={<IconX className="size-3.5" />}
          onClick={() => {
            field.onChange(null)
          }}
        >
          Fjern verdi
        </Button>
      </div>
    </FieldShell>
  )
}

function MembershipDateField({
  control,
  name,
  label,
  required,
  clearable,
  disabled,
}: {
  control: Control<FormValues>
  name: "start" | "end"
  label: string
  required?: boolean
  clearable?: boolean
  disabled?: boolean
}) {
  const { setValue, getValues } = useFormContext<FormValues>()
  const value = useWatch({ control, name })

  const semesterDescription =
    value != null ? (isSpringSemester(value) ? `Vår ${value.getFullYear()}` : `Høst ${value.getFullYear()}`) : undefined

  return (
    <div className="flex flex-col gap-2">
      <DateTimePickerField
        control={control}
        withTime={false}
        name={name}
        label={label}
        description={semesterDescription}
        required={required}
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          icon={<IconArrowLeft className="size-3.5" />}
          onClick={() => {
            const base = getValues(name) ?? getCurrentUTC()
            setValue(name, getPreviousSemesterStart(base), { shouldDirty: true, shouldValidate: true })
          }}
        >
          Forrige semester
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          icon={<IconArrowRight className="size-3.5" />}
          onClick={() => {
            const base = getValues(name) ?? getCurrentUTC()
            setValue(name, getNextSemesterStart(base), { shouldDirty: true, shouldValidate: true })
          }}
        >
          Neste semester
        </Button>
        {clearable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            icon={<IconX className="size-3.5" />}
            onClick={() => {
              setValue(name, null, { shouldDirty: true, shouldValidate: true })
            }}
          >
            Fjern sluttdato
          </Button>
        )}
      </div>
    </div>
  )
}
