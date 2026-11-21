"use client"

import { CheckboxGroupField } from "@admin/components/forms/CheckboxGroupField"
import { TextField } from "@admin/components/forms/TextField"
import { FieldShell, getFieldErrorMessage } from "@admin/components/forms/FieldShell"
import { notifyFail } from "@admin/lib/notifications"
import { MAX_MERGE_DELAY_HOURS } from "@dotkomonline/rpc/attendance"
import { createPoolName } from "@dotkomonline/utils"
import { Button, Field, FieldContent, FieldDescription, FieldLabel, TextInput } from "@dotkomonline/ui"
import { Switch } from "@dotkomonline/ui/components/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconRestore } from "@tabler/icons-react"
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
  return yearEntries.map((entry) => entry.key).filter((year) => disabledYears.includes(year) === false)
}

export const PoolFormSchema = z
  .object({
    yearCriteria: z.array(z.number()).min(1, "Du må velge minst ett klassetrinn."),
    capacity: z.int().min(0),
    title: z.string().trim().min(1, "Oppgi et navn på påmeldingsgruppen."),
    fillAddedSeats: z.boolean().optional(),
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
  isPending?: boolean
}

export const PoolForm: FC<PoolFormProps> = (props) => {
  const defaultGeneratedTitle = createPoolName(props.defaultValues.yearCriteria)
  const defaultTitle = props.defaultValues.title === "" ? defaultGeneratedTitle : props.defaultValues.title
  const [isTitleAutomatic, setIsTitleAutomatic] = useState(defaultTitle === defaultGeneratedTitle)

  const form = useForm<PoolFormInput, unknown, PoolFormValues>({
    resolver: zodResolver(PoolFormSchema),
    mode: "onBlur",
    defaultValues: {
      ...props.defaultValues,
      title: defaultTitle,
      fillAddedSeats: false,
    },
  })

  const yearCriteria = form.watch("yearCriteria")
  const capacity = form.watch("capacity")
  const hasCapacityIncrease =
    props.mode === "update" &&
    props.defaultValues.capacity > 0 &&
    (capacity === 0 || capacity > props.defaultValues.capacity)
  const generatedTitle = createPoolName(yearCriteria ?? [])
  const title = useWatch({ control: form.control, name: "title" })
  const canResetTitle = generatedTitle !== "" && title !== generatedTitle

  useEffect(() => {
    if (yearCriteria.length === 0 || !isTitleAutomatic) {
      return
    }

    form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
  }, [yearCriteria, generatedTitle, isTitleAutomatic, form])

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
    try {
      props.onSubmit({ ...values, fillAddedSeats: hasCapacityIncrease && values.fillAddedSeats === true })
    } catch (error) {
      notifyFail({
        title: "Oops!",
        message: (error as Error).message,
      })
    }
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <fieldset disabled={props.isPending} className="flex min-w-0 flex-col gap-5">
        <CheckboxGroupField
          control={form.control}
          name="yearCriteria"
          label="Klassetrinn"
          required
          options={yearOptions}
        />

        <div className="flex flex-col gap-1">
          <TextField
            control={form.control}
            name="title"
            label="Navn"
            required
            onChange={(event) => {
              setIsTitleAutomatic(false)
              form.setValue("title", event.target.value, { shouldDirty: true })
            }}
          />
          {canResetTitle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              icon={<IconRestore className="size-4" />}
              onClick={() => {
                setIsTitleAutomatic(true)
                form.setValue("title", generatedTitle, { shouldDirty: true, shouldValidate: true })
              }}
            >
              Bruk foreslått navn
            </Button>
          )}
        </div>

        <CapacityField control={form.control} setValue={form.setValue} min={props.minCapacity ?? 0} />

        {hasCapacityIncrease && (
          <Controller
            control={form.control}
            name="fillAddedSeats"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  id="fillAddedSeats"
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-describedby="fillAddedSeats-description"
                />
                <FieldContent>
                  <FieldLabel htmlFor="fillAddedSeats">Fyll nye plasser fra køen</FieldLabel>
                  <FieldDescription id="fillAddedSeats-description" className="text-xs">
                    De nye plassene fylles i kø-rekkefølge. De som får plass, får en e-post om at de er påmeldt.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />
        )}

        <TextField
          control={form.control}
          name="mergeDelayHours"
          label="Utsettelse i timer"
          description={
            <>
              Antall timer gruppen må vente i kø før den slås sammen med de andre gruppene og får tildelt plasser.
              Utsettelse krever ubegrenset kapasitet. La feltet stå tomt for ingen utsettelse.
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={props.onClose}>
            Avbryt
          </Button>
          <Button type="submit" variant="default" disabled={props.isPending}>
            {props.isPending
              ? "Oppretter…"
              : props.mode === "create"
                ? "Opprett påmeldingsgruppe"
                : "Endre påmeldingsgruppe"}
          </Button>
        </div>
      </fieldset>
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
            description="Antall plasser før nye påmeldinger settes i kø. La feltet stå tomt for ubegrenset kapasitet."
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
