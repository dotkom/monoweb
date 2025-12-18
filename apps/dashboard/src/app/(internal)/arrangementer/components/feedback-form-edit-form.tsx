import {
  type EventId,
  type FeedbackFormId,
  type FeedbackFormWrite,
  FeedbackFormWriteSchema,
  FeedbackQuestionSchema,
  type FeedbackQuestionWrite,
  FeedbackQuestionWriteSchema,
  getFeedbackQuestionTypeName,
} from "@dotkomonline/types"
import { DragDropContext, Draggable, type DropResult, Droppable } from "@hello-pangea/dnd"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Checkbox,
  CopyButton,
  Divider,
  Group,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core"

import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { env } from "@/lib/env"
import { DateTimePicker } from "@mantine/dates"
import { IconCheck, IconCopy, IconGripVertical, IconInfoCircle, IconTrash } from "@tabler/icons-react"
import { isPast } from "date-fns"
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
import { useDeleteFeedbackFormMutation } from "../mutations"
import { useEventFeedbackPublicResultsTokenGetQuery, useFeedbackAnswersGetQuery } from "../queries"

const typeOptions = Object.values(FeedbackQuestionSchema.shape.type.Values).map((type) => ({
  value: type,
  label: getFeedbackQuestionTypeName(type),
}))

const FormValuesSchema = z
  .object({
    feedbackForm: FeedbackFormWriteSchema,
    questions: FeedbackQuestionWriteSchema.array(),
  })
  .superRefine((val, ctx) => {
    if (isPast(val.feedbackForm.answerDeadline)) {
      const message = "Svarfrist må være frem i tid"
      const code = "custom"
      ctx.addIssue({ message, code, path: ["feedbackForm.answerDeadline"] })
    }

    return true
  })

export type FormValues = z.infer<typeof FormValuesSchema>

interface Props {
  onSubmit(id: FeedbackFormId, feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): void
  defaultValues?: FormValues
  feedbackFormId: FeedbackFormId
  eventId: EventId
}

export const FeedbackFormEditForm: FC<Props> = ({ onSubmit, defaultValues, feedbackFormId, eventId }) => {
  const publicResultsTokenQuery = useEventFeedbackPublicResultsTokenGetQuery(feedbackFormId)

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
      showInPublicResults: true,
    }

    append(question)
  }

  const handleSubmit = (values: FormValues) => {
    // Update order on questions
    values.questions = values.questions.map((question, idx) => ({ ...question, order: idx }))

    onSubmit(feedbackFormId, values.feedbackForm, values.questions)
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

  const resultsPageUrl = new URL(`tilbakemelding/${eventId}/svar/`, env.NEXT_PUBLIC_WEB_URL)
  const publicResultsPageUrl = new URL(`${publicResultsTokenQuery.data}`, resultsPageUrl)
  const previewPageUrl = new URL(`tilbakemelding/${eventId}`, env.NEXT_PUBLIC_WEB_URL)
  previewPageUrl.searchParams.append("preview", "true")

  return (
    <Stack>
      <Stack gap={4}>
        <Title order={4}>Svar</Title>
        <CopyLinkRow
          url={resultsPageUrl.toString()}
          label="Privat lenke"
          info="Alle svar. Kun tilgjengelig for administratorer"
        />
        {publicResultsTokenQuery?.data && (
          <CopyLinkRow
            url={publicResultsPageUrl.toString()}
            label="Bedriftslenke"
            info="Viser kun svar markert med 'Vis til bedrift'. Tilgjengelig for alle med lenken"
          />
        )}
        <Anchor href={previewPageUrl.toString()}>Se forhåndsvisning</Anchor>
      </Stack>

      <Divider />
      <Title order={4}>Rediger</Title>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack>
            <Controller
              name={"feedbackForm.answerDeadline"}
              control={form.control}
              render={({ field }) => <DateTimePicker value={field.value} onChange={field.onChange} label="Svarfrist" />}
            />
            {form.formState.errors.feedbackForm?.answerDeadline?.message && (
              <Text size="sm" c="red">
                {form.formState.errors.feedbackForm?.answerDeadline?.message}
              </Text>
            )}

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
                      {fields.length === 0 && <Text c="red">Ingen spørsmål lagt til</Text>}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>
            <Group>
              <Button type="submit">Lagre skjema</Button>
              <Tooltip disabled={!hasFormAnswers} label="Skjemaet har mottatt svar og kan ikke slettes">
                <Button
                  bg="red"
                  onClick={openDeleteFormModal}
                  disabled={hasFormAnswers}
                  leftSection={<IconTrash height={14} width={14} />}
                >
                  Slett
                </Button>
              </Tooltip>
            </Group>
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  )
}

const CopyLinkRow = ({ url, label, info }: { url: string; label: string; info: string }) => (
  <Group gap={8}>
    <Anchor href={url}>{label}</Anchor>
    <CopyButton value={url}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Kopiert" : "Kopier"}>
          <ActionIcon color="gray" variant="subtle" onClick={copy} size="sm">
            {copied ? <IconCheck /> : <IconCopy />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
    <Tooltip label={info}>
      <ActionIcon variant="subtle" color="gray" size="sm">
        <IconInfoCircle />
      </ActionIcon>
    </Tooltip>
  </Group>
)

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
                <IconGripVertical cursor="grab" />
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
                <Controller
                  name={`questions.${index}.showInPublicResults`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label="Vis til bedrift"
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
                  <IconTrash />
                </Button>
              </Tooltip>
            </Group>
          </Group>
        </Card>
      )}
    </Draggable>
  )
})
