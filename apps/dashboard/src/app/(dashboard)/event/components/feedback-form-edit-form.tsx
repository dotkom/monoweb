import {
  type FeedbackFormId,
  FeedbackFormWriteSchema,
  FeedbackQuestionSchema,
  type FeedbackQuestionWrite,
} from "@dotkomonline/types"
import { DragDropContext, Draggable, type DropResult, Droppable } from "@hello-pangea/dnd"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button, Card, Checkbox, Divider, Group, Select, Stack, TagsInput, TextInput, Tooltip } from "@mantine/core"
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
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type z from "zod"
import { useDeleteFeedbackFormMutation } from "../mutations"
import { useFeedbackAnswersGetQuery } from "../queries"

const FormValuesSchema = FeedbackFormWriteSchema.omit({ eventId: true })

export type FormValues = z.infer<typeof FormValuesSchema>

const typeOptions = Object.values(FeedbackQuestionSchema.shape.type.Values).map((type) => ({
  value: type,
  label: type,
}))

interface Props {
  onSubmit(id: FeedbackFormId, data: FormValues): void
  defaultValues?: FormValues
  feedbackFormId: FeedbackFormId
}

export const FeedbackFormEditForm: FC<Props> = ({ onSubmit, defaultValues, feedbackFormId }) => {
  defaultValues?.questions.sort((a, b) => a.order - b.order)

  const form = useForm<FormValues>({
    mode: "onSubmit",
    resolver: zodResolver(FormValuesSchema),
    defaultValues,
  })

  const { fields, append, remove, move } = useFieldArray({
    name: "questions",
    control: form.control,
    keyName: "fieldId",
  })

  const addQuestion = () => {
    const question: FeedbackQuestionWrite = {
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

    onSubmit(feedbackFormId, values)
  }

  const handleDragEnd = ({ destination, source }: DropResult<string>) => {
    if (!destination || destination.index === source.index) return
    move(source.index, destination.index)
  }

  const formAnswers = useFeedbackAnswersGetQuery(feedbackFormId)
  const hasFormAnswers = (formAnswers.data?.length ?? 0) > 0

  const answeredQuestionIds = new Set(formAnswers.data?.flatMap((a) => a.questionAnswers.map((qa) => qa.questionId)))

  const deleteFormMutation = useDeleteFeedbackFormMutation()

  const openDeleteFormModal = useConfirmDeleteModal({
    title: "Slett tilbakemeldingsskjema",
    text: "Er du sikker på at du vil slette tilbakemeldingsskjemaet?",
    onConfirm: () => {
      deleteFormMutation.mutate(feedbackFormId)
    },
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack>
          <Controller
            name={"isActive"}
            control={form.control}
            render={({ field }) => (
              <Checkbox
                label="Aktiv"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            )}
          />
          <Group mt={16}>
            <Button onClick={addQuestion}>Legg til spørsmål</Button>
          </Group>
          <Divider />
          <Card withBorder>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions" direction="vertical">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {fields.map((field, index) => (
                      <QuestionCard
                        key={field.fieldId}
                        fieldId={field.fieldId}
                        control={form.control}
                        index={index}
                        onRemove={remove}
                        hasAnswers={!!field.id && answeredQuestionIds.has(field.id)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
          <Group>
            <Tooltip label="Legg til minst ett spørsmål først" disabled={fields.length > 0}>
              <Button type="submit" disabled={fields.length === 0}>
                Lagre skjema
              </Button>
            </Tooltip>
            <Tooltip
              disabled={!hasFormAnswers}
              label="Skjemaet har mottatt svar og kan ikke slettes. Deaktiver det for å stoppe nye svar"
            >
              <Button
                type="button"
                onClick={openDeleteFormModal}
                variant="outline"
                color="red"
                disabled={hasFormAnswers}
              >
                <Icon icon="tabler:trash" />
              </Button>
            </Tooltip>
          </Group>
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
  hasAnswers: boolean
}

const QuestionCard = React.memo(function QuestionCard({
  index,
  onRemove,
  control,
  fieldId,
  hasAnswers,
}: QuestionCardProps) {
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
                    <Tooltip disabled={!hasAnswers} label="Typen kan ikke endres fordi spørsmålet har blitt besvart">
                      <Select
                        label="Type"
                        data={typeOptions}
                        required={true}
                        disabled={hasAnswers}
                        {...field}
                        onChange={(value) => {
                          field.onChange(value)
                          if (value !== "SELECT" && value !== "MULTISELECT") {
                            setValue(`questions.${index}.options`, [])
                          }
                        }}
                      />
                    </Tooltip>
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
              <Tooltip disabled={!hasAnswers} label="Dette spørsmålet har blitt besvart og kan ikke slettes">
                <Button color="red" variant="light" onClick={() => onRemove(index)} disabled={hasAnswers}>
                  <Icon icon="tabler:trash" />
                </Button>
              </Tooltip>
            </Group>
          </Group>
        </Card>
      )}
    </Draggable>
  )
})
