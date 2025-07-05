import {
  FeedbackFormWriteSchema,
  FeedbackQuestionSchema,
  type FeedbackQuestionUpdate,
  FeedbackQuestionUpdateSchema,
} from "@dotkomonline/types"
import { DragDropContext, Draggable, type DropResult, Droppable } from "@hello-pangea/dnd"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button, Card, Checkbox, Divider, Group, Select, Stack, TagsInput, TextInput, Title } from "@mantine/core"
import React, { type FC } from "react"
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
  form: FeedbackFormWriteSchema.omit({ eventId: true }),
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

export const FeedbackForm: FC<Props> = ({ onSubmit, defaultValues }) => {
  defaultValues?.questions.sort((a, b) => a.order - b.order)

  const form = useForm<FormValues>({
    mode: "onSubmit",
    resolver: zodResolver(FormValuesSchema),
    defaultValues,
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
      order: fields.length,
    }

    append(question)
  }

  const handleSubmit = (values: FormValues) => {
    // Update question order
    values.questions = values.questions.map((question, idx) => ({ ...question, order: idx }))

    onSubmit(values)
  }

  const handleDragEnd = ({ destination, source }: DropResult<string>) => {
    if (!destination || destination.index === source.index) return
    move(source.index, destination.index)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack>
          <Title order={3}>Tilbakemeldingsskjema</Title>
          <Controller
            name={"form.isActive"}
            control={form.control}
            render={({ field }) => (
              <Checkbox
                label="Aktiv"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            )}
          />
          <Group>
            <Button onClick={addQuestion}>Legg til spørsmål</Button>
            <Button type="submit" color="green" disabled={fields.length === 0}>
              Lagre
            </Button>
          </Group>
          <Divider />
          <Card withBorder>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions" direction="vertical">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {fields.map((field, index) => (
                      <QuestionCard
                        key={field.id}
                        fieldId={field.id}
                        control={form.control}
                        index={index}
                        onRemove={remove}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Stack>
      </form>
    </FormProvider>
  )
}

interface QuestionCardProps {
  index: number
  control: Control<FormValues>
  fieldId: string
  onRemove(index: number): void
}

const QuestionCard = React.memo(function QuestionCard({ index, onRemove, control, fieldId }: QuestionCardProps) {
  const { setValue } = useFormContext()

  const type = useWatch<FormValues>({
    control,
    name: `questions.${index}.type`,
  })

  return (
    <Draggable index={index} draggableId={fieldId}>
      {(provided) => (
        <Card withBorder ref={provided.innerRef} {...provided.draggableProps} mb={24}>
          <Group wrap="nowrap">
            <Group>
              <div {...provided.dragHandleProps}>
                <Icon icon="tabler:grip-vertical" cursor={"grab"} />
              </div>
            </Group>
            <Stack>
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
                        if (value !== "SELECT" && value !== "MULTISELECT") {
                          setValue(`questions.${index}.options`, [])
                        }
                      }}
                    />
                  )}
                />
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
              {(type === "SELECT" || type === "MULTISELECT") && (
                <Group>
                  <Controller
                    name={`questions.${index}.options`}
                    control={control}
                    render={({ field }) => (
                      <TagsInput
                        label="Alternativer"
                        value={field.value.map((opt) => opt.name)}
                        onChange={(values) => {
                          field.onChange(values.map((name) => field.value.find((opt) => opt.name === name) ?? { name }))
                        }}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>

            <Group gap={4} mb={"auto"} ml={"auto"}>
              <Button color="red" variant="light" onClick={() => onRemove(index)}>
                <Icon icon="tabler:trash" />
              </Button>
            </Group>
          </Group>
        </Card>
      )}
    </Draggable>
  )
})
