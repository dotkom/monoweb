import { createLabelledCheckboxGroupInput } from "@/components/forms/CheckboxGroup"
import { createNumberInput } from "@/components/forms/NumberInput"
import { createTextInput } from "@/components/forms/TextInput"
import type { InputProducerResult } from "@/components/forms/types"
import { notifyFail } from "@/lib/notifications"
import { zodResolver } from "@hookform/resolvers/zod"
import { ActionIcon, Box, Button, Flex } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { type FC, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createDefaultPoolName } from "./utils"

const yearEntries = [
  { label: "1. klasse", key: 1 },
  { label: "2. klasse", key: 2 },
  { label: "3. klasse", key: 3 },
  { label: "4. klasse", key: 4 },
  { label: "5. klasse", key: 5 },
]

export interface PoolFormProps {
  onSubmit(values: PoolForm): void
  disabledYears: number[]
  onClose(): void
  defaultValues: PoolForm
  mode: "create" | "update"
  minCapacity?: number
}

export const PoolFormSchema = z.object({
  yearCriteria: z.array(z.number()).min(1, "Du må velge minst ett klassetrinn."),
  capacity: z.number().min(0),
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
    .number()
    .int()
    .min(0, "Utsettelse må være mellom 0 og 96 timer (4 dager).")
    .max(96, "Utsettelse må være mellom 0 og 96 timer (4 dager).")
    .nullable()),
})
export type PoolForm = z.infer<typeof PoolFormSchema>

export const usePoolForm = (props: PoolFormProps) => {
  const form = useForm<PoolForm>({
    resolver: zodResolver(PoolFormSchema),
    mode: "onBlur",
    defaultValues: {
      ...props.defaultValues,
      title: props.defaultValues.title || createDefaultPoolName(props.defaultValues.yearCriteria),
    },
  })

  const yearCriteria = form.watch("yearCriteria")

  const generatedTitle = useMemo(() => createDefaultPoolName(yearCriteria ?? []), [yearCriteria])
  const defaultTitle = form.formState.defaultValues?.title

  const titleIsDirty =
    Boolean(form.formState.dirtyFields.title) ||
    (form.getValues("title") === defaultTitle && defaultTitle !== generatedTitle)

  const fields = useMemo(
    () =>
      [
        {
          name: "yearCriteria",
          component: createLabelledCheckboxGroupInput({
            disabledOptions: props.disabledYears,
            entries: yearEntries,
          }),
        },
        {
          name: "title",
          component: createTextInput({
            label: "Tittel",
            withAsterisk: true,
            rightSection: (
              <ActionIcon
                size="input-xs"
                color="gray"
                variant="subtle"
                onClick={() => {
                  form.resetField("title", { defaultValue: defaultTitle })
                  form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
                }}
              >
                <IconX height={20} width={20} />
              </ActionIcon>
            ),
          }),
        },
        {
          name: "capacity",
          component: createNumberInput({
            label: "Kapasitet",
            min: props.minCapacity ?? 0,
          }),
        },
        {
          name: "mergeDelayHours",
          component: createNumberInput({
            label: "Utsettelse i timer",
            placeholder: "Ingen utsettelse",
            min: 0,
          }),
        },
      ] satisfies { name: keyof PoolForm; component: InputProducerResult<PoolForm> }[],
    [defaultTitle, generatedTitle, props.disabledYears, form.resetField, form.setValue, props.minCapacity]
  )

  useEffect(() => {
    if (titleIsDirty) {
      return
    }

    form.setValue("title", generatedTitle, { shouldDirty: false, shouldTouch: false })
    form.trigger("title")
  }, [titleIsDirty, generatedTitle, form.setValue, form.trigger])

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
