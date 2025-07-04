import { FeedbackQuestionSchema, type FeedbackQuestionUpdate, FeedbackQuestionUpdateSchema } from "@dotkomonline/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button, Card, Checkbox, Group, Select, Stack, TagsInput, TextInput } from "@mantine/core"
import type { FC } from "react"
import {
  type Control,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form"
import z from "zod"

const FormValuesSchema = z.object({
  questions: z.array(FeedbackQuestionUpdateSchema),
})

export type FormValues = z.infer<typeof FormValuesSchema>

const typeOptions = Object.values(FeedbackQuestionSchema.shape.type.Values).map((type) => ({
  value: type,
  label: type,
}))

interface Props {
  onSubmit(data: FormValues): void
  defaultValues?: FormValues
}

//TODO: Add drag n drop re-ordering
export const FeedbackForm: FC<Props> = ({ onSubmit, defaultValues }) => {
  const form = useForm<FormValues>({
    mode: "onSubmit",
    resolver: zodResolver(FormValuesSchema),
    defaultValues: defaultValues,
  })

  const { fields, append, remove, move } = useFieldArray({
    name: "questions",
    control: form.control,
  })

  const addQuestion = () => {
    const question: FeedbackQuestionUpdate = {
      label: "Spørsmål",
      type: "TEXT",
      required: false,
      options: [],
      order: 0,
    }

    append(question)
  }

  const handleSubmit = async (values: FormValues) => {
    onSubmit(values)
    form.reset(values)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Group>
          <Button onClick={addQuestion}>Legg til spørsmål</Button>
          <Button type="submit" color="green" disabled={!form.formState.isDirty || fields.length === 0}>
            Lagre
          </Button>
        </Group>
        <Card mt={16} withBorder>
          <Stack>
            {fields.map((field, index) => (
              <QuestionCard key={field.id} control={form.control} index={index} onRemove={remove} />
            ))}
          </Stack>
        </Card>
      </form>
    </FormProvider>
  )
}

interface QuestionCardProps {
  index: number
  control: Control<FormValues>
  onRemove(index: number): void
}

function QuestionCard({ index, onRemove, control }: QuestionCardProps) {
  const { setValue } = useFormContext()

  const type = useWatch<FormValues>({
    control,
    name: `questions.${index}.type`,
  })

  return (
    <Card withBorder>
      <Group>
        <Group>
          <Controller
            name={`questions.${index}.label`}
            control={control}
            render={({ field }) => <TextInput label="Spørsmål" {...field} />}
          />
          <Controller
            name={`questions.${index}.type`}
            control={control}
            render={({ field }) => (
              <Select
                label="Type"
                data={typeOptions}
                required={true}
                {...field}
                onChange={(value) => {
                  field.onChange(value)
                  if (value !== "SELECT") {
                    setValue(`questions.${index}.options`, [])
                  }
                }}
              />
            )}
          />
          {type === "SELECT" && (
            <Controller
              name={`questions.${index}.options`}
              control={control}
              render={({ field }) => (
                <TagsInput
                  label="Alternativer"
                  value={field.value.map((opt) => opt.label)}
                  onChange={(values) => {
                    field.onChange(
                      values.map(
                        (label) => field.value.find((opt) => opt.label === label) ?? { id: crypto.randomUUID(), label }
                      )
                    )
                  }}
                />
              )}
            />
          )}
          <Controller
            name={`questions.${index}.required`}
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Obligatorisk"
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            )}
          />
        </Group>

        <Group gap={4} mt={"auto"} ml={"auto"}>
          <Button color="red" variant="light" onClick={() => onRemove(index)}>
            <Icon icon="tabler:trash" />
          </Button>
        </Group>
      </Group>
    </Card>
  )
}
