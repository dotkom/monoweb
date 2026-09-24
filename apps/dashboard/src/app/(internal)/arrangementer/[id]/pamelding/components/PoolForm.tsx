"use client"

import { CheckboxGroupField } from "@/components/forms/CheckboxGroupField"
import { TextField } from "@/components/forms/TextField"
import { FieldShell, getFieldErrorMessage } from "@/components/forms/FieldShell"
import { notifyFail } from "@/lib/notifications"
import { MAX_MERGE_DELAY_HOURS } from "@dotkomonline/rpc/attendance"
import { createPoolName } from "@dotkomonline/utils"
import { Button, TextInput } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconX } from "@tabler/icons-react"
import { type FC, useEffect, useMemo, useState } from "react"
import { type Control, Controller, type UseFormSetValue, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const yearEntries = [
  { label: "1. klasse", key: 1 },
  { label: "2. klasse", key: 2 },
  { label: "3. klasse", key: 3 },
  { label: "4. klasse", key: 4 },
  { label: "5. klasse", key: 5 },
]

export function getAvailablePoolYears(disabledYears: number[]) {
  return yearEntries.map((entry) => entry.key).filter((year) => !disabledYears.includes(year))
}

export const PoolFormSchema = z
  .object({
    yearCriteria: z.array(z.number()).min(1, "Du må velge minst ett klassetrinn."),
    capacity: z.int().min(0),
    title: z.string().min(1),
    mergeDelayHours: z.preprocess((val) => {
      if (typeof val === "number") {
        const num = Number(val)

        if (num === 0) {
          return null
        }

        return num
      }

      return null
    }, z
      .int()
      .min(0, `Utsettelse må være mellom 0 og ${MAX_MERGE_DELAY_HOURS} timer.`)
      .max(MAX_MERGE_DELAY_HOURS, `Utsettelse må være mellom 0 og ${MAX_MERGE_DELAY_HOURS} timer.`)
      .nullable()),
  })
  .superRefine((values, context) => {
    if (values.mergeDelayHours === null || values.mergeDelayHours === 0) {
      return
    }

    if (values.capacity === 0) {
      return
    }

    context.addIssue({
      code: "custom",
      message: "Kapasitet må være ubegrenset når gruppen har utsettelse",
      path: ["capacity"],
    })
  })

export type PoolFormValues = z.infer<typeof PoolFormSchema>
type PoolFormInput = z.input<typeof PoolFormSchema>

function getCapacityDisplayValue(capacity: number, isFocused: boolean): string {
  if (capacity === 0 && !isFocused) {
    return ""
  }

  return String(capacity)
}

export interface PoolFormProps {
  onSubmit(values: PoolFormValues): void
  disabledYears: number[]
  onClose(): void
  defaultValues: PoolFormValues
  mode: "create" | "update"
  minCapacity?: number
}

export const PoolForm: FC<PoolFormProps> = (props) => {
  const form = useForm<PoolFormInput, unknown, PoolFormValues>({
    resolver: zodResolver(PoolFormSchema),
    mode: "onBlur",
    defaultValues: {
      ...props.defaultValues,
      title: props.defaultValues.title || createPoolName(props.defaultValues.yearCriteria),
    },
  })

  const yearCriteria = form.watch("yearCriteria")
  const generatedTitle = createPoolName(yearCriteria ?? [])
  const defaultTitle = form.formState.defaultValues?.title
  const isDefaultGeneratedTitle = defaultTitle === createPoolName(props.defaultValues.yearCriteria ?? [])
  const isTitleDirty = Boolean(form.formState.dirtyFields.title)

  useEffect(() => {
    if (!yearCriteria || !isDefaultGeneratedTitle || isTitleDirty) {
      return
    }

    form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
    form.trigger("title")
  }, [yearCriteria, generatedTitle, isDefaultGeneratedTitle, isTitleDirty, form])

  const yearOptions = useMemo(
    () =>
      yearEntries.map((entry) => ({
        value: entry.key,
        label: entry.label,
        disabled: props.disabledYears.includes(entry.key),
      })),
    [props.disabledYears]
  )

  const onSubmit = form.handleSubmit((values) => {
    form.resetField("yearCriteria")
    try {
      props.onSubmit(values)
    } catch (e) {
      notifyFail({
        title: "Oops!",
        message: (e as Error).message,
      })
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <CheckboxGroupField
        control={form.control}
        name="yearCriteria"
        label="Klassetrinn"
        required
        options={yearOptions}
      />

      <div className="flex flex-col gap-1">
        <TextField control={form.control} name="title" label="Tittel" required />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          icon={<IconX className="size-4" />}
          onClick={() => {
            form.resetField("title", { defaultValue: defaultTitle })
            form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
          }}
        >
          Tilbakestill tittel
        </Button>
      </div>

      <CapacityField control={form.control} setValue={form.setValue} min={props.minCapacity ?? 0} />

      <TextField
        control={form.control}
        name="mergeDelayHours"
        label="Utsettelse i timer"
        description={
          <>
            Hvor mange timer brukere i gruppen skal stå i kø før de blir påmeldt.
            <br />
            Påmeldingsgruppen vil slå seg sammen med andre påmeldingsgrupper etter utsettelsestiden har gått ut. Dette
            gir andre muligheten til å melde seg på før den som meldte seg på får en plass.
            <br />
            Kapasiteten må være ubegrenset dersom gruppen har utsettelse.
          </>
        }
        placeholder="Ingen utsettelse"
        type="number"
        onChange={(event) => {
          const next = event.target.valueAsNumber
          form.setValue("mergeDelayHours", Number.isNaN(next) ? null : next, {
            shouldValidate: true,
          })
        }}
      />

      <Button type="submit" variant="default" className="w-fit">
        {props.mode === "create" ? "Opprett påmeldingsgruppe" : "Endre påmeldingsgruppe"}
      </Button>
    </form>
  )
}

function CapacityField({
  control,
  setValue,
  min,
}: {
  control: Control<PoolFormInput>
  setValue: UseFormSetValue<PoolFormInput>
  min: number
}) {
  const [isFocused, setIsFocused] = useState(false)
  const mergeDelayHours = useWatch({ control, name: "mergeDelayHours" })
  const hasMergeDelay = typeof mergeDelayHours === "number" && mergeDelayHours > 0

  useEffect(() => {
    if (!hasMergeDelay) {
      return
    }

    setValue("capacity", 0, { shouldValidate: true, shouldDirty: true })
  }, [hasMergeDelay, setValue])

  return (
    <Controller
      control={control}
      name="capacity"
      render={({ field, fieldState }) => {
        const capacity = typeof field.value === "number" ? field.value : 0
        const error = getFieldErrorMessage(fieldState.error?.message)

        return (
          <FieldShell
            id="capacity"
            label="Kapasitet"
            required
            error={error}
            description={
              <>
                Antall som kan melde seg på før de automatisk settes i kø. Du kan ha flere påmeldte enn kapasitet dersom
                du admin-påmelder dem.
                <br />
                Kapasitet må være ubegrenset når gruppen har utsettelse.
              </>
            }
          >
            <TextInput
              id="capacity"
              type="number"
              min={min}
              max={hasMergeDelay ? 0 : undefined}
              placeholder="Ubegrenset"
              disabled={hasMergeDelay}
              value={getCapacityDisplayValue(capacity, isFocused)}
              onChange={(event) => {
                const value = event.target.value
                field.onChange(value === "" ? 0 : Number.parseInt(value, 10))
              }}
              onFocus={() => {
                setIsFocused(true)
              }}
              onBlur={() => {
                setIsFocused(false)
              }}
              aria-invalid={error ? true : undefined}
            />
          </FieldShell>
        )
      }}
    />
  )
}
