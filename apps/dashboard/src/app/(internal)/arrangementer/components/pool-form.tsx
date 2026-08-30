import { createLabelledCheckboxGroupInput } from "@/components/forms/CheckboxGroup"
import { createNumberInput } from "@/components/forms/NumberInput"
import { createTextInput } from "@/components/forms/TextInput"
import { getErrorMessage, type InputFieldContext } from "@/components/forms/types"
import { notifyFail } from "@/lib/notifications"
import { MAX_MERGE_DELAY_HOURS } from "@dotkomonline/rpc/attendance"
import { createPoolName } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ActionIcon, Box, Button, Flex, NumberInput } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { type FC, useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
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

function getCapacityMax(hasMergeDelay: boolean) {
  if (hasMergeDelay) {
    return 0
  }

  return undefined
}

export interface PoolFormProps {
  onSubmit(values: PoolForm): void
  disabledYears: number[]
  onClose(): void
  defaultValues: PoolForm
  mode: "create" | "update"
  minCapacity?: number
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
export type PoolForm = z.infer<typeof PoolFormSchema>
type PoolFormInput = z.input<typeof PoolFormSchema>

function getCapacityDisplayValue(capacity: number, isFocused: boolean): string | number {
  if (capacity === 0 && !isFocused) {
    return ""
  }

  return capacity
}

function CapacityInput({
  name,
  state,
  control,
  setValue,
  disabled,
  min,
}: InputFieldContext<PoolFormInput, PoolForm> & { min: number }) {
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
      name={name}
      render={({ field }) => {
        const capacity = typeof field.value === "number" ? field.value : 0

        return (
          <NumberInput
            label="Kapasitet"
            description={
              <>
                Antall som kan melde seg på før de automatisk settes i kø. Du kan ha flere påmeldte enn kapasitet dersom
                du admin-påmelder dem.
                <br />
                Kapasitet må være ubegrenset når gruppen har utsettelse.
              </>
            }
            min={min}
            max={getCapacityMax(hasMergeDelay)}
            withAsterisk
            value={getCapacityDisplayValue(capacity, isFocused)}
            placeholder="Ubegrenset"
            onChange={(value) => field.onChange({ target: { value: value === "" ? 0 : value } })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || hasMergeDelay}
            error={getErrorMessage(state, name)}
            styles={{
              input: {
                "--input-placeholder-color": "var(--mantine-color-text)",
              },
            }}
          />
        )
      }}
    />
  )
}

export const usePoolForm = (props: PoolFormProps) => {
  const form = useForm<PoolFormInput, unknown, PoolForm>({
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

  const { resetField, setValue } = form

  const fields = useMemo(
    () =>
      [
        {
          name: "yearCriteria",
          component: createLabelledCheckboxGroupInput<PoolFormInput, PoolForm>({
            disabledOptions: props.disabledYears,
            entries: yearEntries,
          }),
        },
        {
          name: "title",
          component: createTextInput<PoolFormInput, PoolForm>({
            label: "Tittel",
            required: true,
            rightSection: (
              <ActionIcon
                size="input-xs"
                color="gray"
                variant="subtle"
                onClick={() => {
                  resetField("title", { defaultValue: defaultTitle })
                  setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
                }}
              >
                <IconX height={20} width={20} />
              </ActionIcon>
            ),
          }),
        },
        {
          name: "capacity",
          component: (fieldContext: InputFieldContext<PoolFormInput, PoolForm>) => (
            <CapacityInput {...fieldContext} min={props.minCapacity ?? 0} />
          ),
        },
        {
          name: "mergeDelayHours",
          component: createNumberInput<PoolFormInput, PoolForm>({
            label: "Utsettelse i timer",
            description: (
              <>
                Hvor mange timer brukere i gruppen skal stå i kø før de blir påmeldt.
                <br />
                Påmeldingsgruppen vil slå seg sammen med andre påmeldingsgrupper etter utsettelsestiden har gått ut.
                Dette gir andre muligheten til å melde seg på før den som meldte seg på får en plass.
                <br />
                Kapasiteten må være ubegrenset dersom gruppen har utsettelse.
              </>
            ),
            placeholder: "Ingen utsettelse",
            min: 0,
            max: MAX_MERGE_DELAY_HOURS,
            suffix: " timer",
            startValue: 1,
          }),
        },
      ] as const,
    [defaultTitle, generatedTitle, props.disabledYears, resetField, setValue, props.minCapacity]
  )

  useEffect(() => {
    if (!yearCriteria || !isDefaultGeneratedTitle || isTitleDirty) {
      return
    }

    form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
    form.trigger("title")
  }, [yearCriteria, generatedTitle, isDefaultGeneratedTitle, isTitleDirty, form])

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

  const Form = (
    <form onSubmit={onSubmit}>
      <Flex direction="column" gap="md">
        {fields.map(({ name, component: InputComponent }) => (
          <InputComponent
            defaultValue={form.formState.defaultValues?.[name]}
            key={name}
            name={name}
            register={form.register}
            control={form.control}
            state={form.formState}
            setValue={form.setValue}
            getValues={form.getValues}
            setError={form.setError}
            clearErrors={form.clearErrors}
          />
        ))}
        <Button type="submit">{props.mode === "create" ? "Opprett påmeldingsgruppe" : "Endre påmeldingsgruppe"}</Button>
      </Flex>
    </form>
  )

  return { Form }
}

export const PoolForm: FC<PoolFormProps> = (props) => {
  const { Form } = usePoolForm(props)

  return <Box>{Form}</Box>
}
