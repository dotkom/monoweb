import type { EventId } from "@dotkomonline/rpc/event"
import {
  type FeedbackForm,
  type FeedbackFormId,
  type FeedbackFormWrite,
  FeedbackFormWriteSchema,
  FeedbackQuestionSchema,
  type FeedbackQuestionWrite,
  FeedbackQuestionWriteSchema,
  getFeedbackQuestionTypeName,
} from "@dotkomonline/rpc/feedback-form"
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
  Loader,
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
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react"
import { skipToken } from "@tanstack/react-query"
import { isPast } from "date-fns"
import React, { type FC, useCallback, useEffect, useRef, useState } from "react"
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

const typeOptions = Object.values(FeedbackQuestionSchema.shape.type.enum).map((type) => ({
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
      ctx.addIssue({ message: "Svarfrist må være frem i tid", code: "custom", path: ["feedbackForm.answerDeadline"] })
    }

    if (val.questions.length === 0) {
      ctx.addIssue({ message: "Legg til minst ett spørsmål", code: "custom", path: ["questions"] })
    }

    for (const [index, question] of val.questions.entries()) {
      if ((question.type === "SELECT" || question.type === "MULTISELECT") && question.options.length < 1) {
        ctx.addIssue({
          message: "Legg til minst ett alternativ",
          code: "custom",
          path: ["questions", index, "options"],
        })
      }
    }
  })

export type FormValues = z.infer<typeof FormValuesSchema>
type FormInput = z.input<typeof FormValuesSchema>

export function toFeedbackFormValues(form: FeedbackForm): FormValues {
  return {
    feedbackForm: {
      eventId: form.eventId,
      answerDeadline: form.answerDeadline,
    },
    questions: form.questions.map((question) => ({
      id: question.id,
      label: question.label,
      type: question.type,
      required: question.required,
      order: question.order,
      showInPublicResults: question.showInPublicResults,
      options: question.options.map((option) => ({ id: option.id, name: option.name })),
    })),
  }
}

function withSavedIds(values: FormInput, saved: FormValues): FormValues {
  return {
    feedbackForm: {
      eventId: values.feedbackForm.eventId,
      answerDeadline: values.feedbackForm.answerDeadline,
    },
    questions: values.questions.map((question, index) => {
      const savedQuestion =
        (question.id ? saved.questions.find((candidate) => candidate.id === question.id) : undefined) ??
        saved.questions[index]

      return {
        id: question.id ?? savedQuestion?.id,
        label: question.label,
        type: question.type,
        required: question.required,
        order: index,
        showInPublicResults: question.showInPublicResults ?? savedQuestion?.showInPublicResults ?? true,
        options: question.options.map((option, optionIndex) => ({
          name: option.name,
          id: option.id ?? savedQuestion?.options[optionIndex]?.id,
        })),
      }
    }),
  }
}

interface Props {
  onSave(feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm>
  defaultValues: FormValues
  feedbackFormId?: FeedbackFormId
  eventId: EventId
  readOnly?: boolean
}

export const FeedbackFormEditForm: FC<Props> = ({ onSave, defaultValues, feedbackFormId, eventId, readOnly }) => {
  const publicResultsTokenQuery = useEventFeedbackPublicResultsTokenGetQuery(feedbackFormId ?? skipToken)

  const form = useForm<FormInput, unknown, FormValues>({
    mode: "onBlur",
    resolver: zodResolver(FormValuesSchema),
    defaultValues,
  })

  const { fields, append, remove, move } = useFieldArray({
    name: "questions",
    control: form.control,
    keyName: "fieldId",
  })

  const isSavingRef = useRef(false)
  const needsSaveRef = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPersisted, setIsPersisted] = useState(() => Boolean(feedbackFormId))

  useEffect(() => {
    if (feedbackFormId) {
      setIsPersisted(true)
    }
  }, [feedbackFormId])

  const save = useCallback(() => {
    if (readOnly) {
      return
    }

    needsSaveRef.current = true
    if (isSavingRef.current) {
      return
    }

    isSavingRef.current = true
    setIsSaving(true)

    const flush = async () => {
      try {
        while (needsSaveRef.current) {
          needsSaveRef.current = false
          await form.handleSubmit(async (values) => {
            const saved = await onSave(
              values.feedbackForm,
              values.questions.map((question, index) => ({ ...question, order: index }))
            )
            setIsPersisted(true)
            form.reset(withSavedIds(form.getValues(), toFeedbackFormValues(saved)))
          })()
        }
      } finally {
        isSavingRef.current = false
        setIsSaving(false)
        if (needsSaveRef.current) {
          save()
        }
      }
    }

    void flush()
  }, [form, onSave, readOnly])

  const addQuestion = () => {
    append({
      label: "Spørsmål",
      type: "TEXT",
      required: false,
      options: [],
      order: fields.length,
      showInPublicResults: true,
    })
    save()
  }

  const handleDragEnd = ({ destination, source }: DropResult<string>) => {
    if (!destination || destination.index === source.index) {
      return
    }
    move(source.index, destination.index)
    save()
  }

  const formAnswers = useFeedbackAnswersGetQuery(feedbackFormId ?? skipToken)
  const hasFormAnswers = (formAnswers.data?.length ?? 0) > 0
  const answeredQuestionIds = new Set(formAnswers.data?.flatMap((a) => a.questionAnswers.map((qa) => qa.questionId)))

  const deleteFormMutation = useDeleteFeedbackFormMutation()
  const openDeleteFormModal = useConfirmDeleteModal({
    title: "Slett tilbakemeldingsskjema",
    text: "Er du sikker på at du vil slette tilbakemeldingsskjemaet?",
    onConfirm: () => {
      if (feedbackFormId) {
        deleteFormMutation.mutate(feedbackFormId)
      }
    },
  })

  const resultsPageUrl = new URL(`tilbakemelding/${eventId}/svar`, env.NEXT_PUBLIC_WEB_URL)
  const publicResultsPageUrl = new URL(`${publicResultsTokenQuery.data}`, resultsPageUrl)
  const previewPageUrl = new URL(`tilbakemelding/${eventId}`, env.NEXT_PUBLIC_WEB_URL)
  previewPageUrl.searchParams.append("preview", "true")

  const questionsError =
    typeof form.formState.errors.questions?.message === "string" ? form.formState.errors.questions.message : undefined

  const { isDirty } = form.formState

  return (
    <Stack>
      {feedbackFormId && (
        <Stack gap="md">
          <Title order={4}>Svar</Title>
          <CopyLinkRow
            url={resultsPageUrl.toString()}
            label="Privat lenke"
            info="Alle svar. Krever innlogging som administrator. Ikke del med bedrifter."
          />

          {publicResultsTokenQuery?.data && (
            <CopyLinkRow
              url={publicResultsPageUrl.toString()}
              label="Bedriftslenke"
              info="Viser kun svar markert med 'Vis til bedrift'. Alle med lenken kan se dem."
            />
          )}
        </Stack>
      )}

      <Divider />

      <Group align="center" gap="md">
        <Title order={4}>Rediger</Title>
        <SaveStatus isSaving={isSaving} isDirty={isDirty} isPersisted={isPersisted} />
      </Group>

      {feedbackFormId && (
        <Anchor
          href={previewPageUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          Se forhåndsvisning
          <IconExternalLink size={14} />
        </Anchor>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <Stack>
            <Controller
              name="feedbackForm.answerDeadline"
              control={form.control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    void save()
                  }}
                  label="Svarfrist"
                  description="Brukere som ikke har svart på skjemaet innen svarfristen vil få 2 prikker."
                  disabled={readOnly}
                />
              )}
            />
            {form.formState.errors.feedbackForm?.answerDeadline?.message && (
              <Text size="sm" c="red">
                {form.formState.errors.feedbackForm.answerDeadline.message}
              </Text>
            )}

            <Group mt={16}>
              <Button onClick={addQuestion} disabled={readOnly}>
                Legg til spørsmål
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
                          key={field.id ?? field.fieldId}
                          fieldId={field.id ?? field.fieldId}
                          control={form.control}
                          index={index}
                          onRemove={(i) => {
                            remove(i)
                            save()
                          }}
                          onSave={save}
                          hasAnswers={!!field.id && answeredQuestionIds.has(field.id)}
                          readOnly={readOnly}
                        />
                      ))}
                      {fields.length === 0 && <Text c="red">Ingen spørsmål lagt til</Text>}
                      {questionsError && fields.length > 0 && (
                        <Text size="sm" c="red">
                          {questionsError}
                        </Text>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>
            {feedbackFormId && (
              <Group>
                <Tooltip disabled={!hasFormAnswers} label="Skjemaet har mottatt svar og kan ikke slettes">
                  <Button
                    bg="red"
                    onClick={openDeleteFormModal}
                    disabled={hasFormAnswers || readOnly}
                    leftSection={<IconTrash height={14} width={14} />}
                  >
                    Slett
                  </Button>
                </Tooltip>
              </Group>
            )}
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  )
}

const CopyLinkRow = ({ url, label, info }: { url: string; label: string; info: string }) => (
  <TextInput
    maw={600}
    w="100%"
    label={
      <Anchor
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        {label}
        <IconExternalLink size={14} />
      </Anchor>
    }
    description={info}
    descriptionProps={{ c: "var(--mantine-color-text)" }}
    value={url}
    readOnly
    rightSection={
      <CopyButton value={url}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Kopiert" : "Kopier"}>
            <ActionIcon color="gray" variant="subtle" onClick={copy} size="sm">
              {copied ? <IconCheck color="green" /> : <IconCopy />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    }
  />
)

const SaveStatus = ({
  isSaving,
  isDirty,
  isPersisted,
}: {
  isSaving: boolean
  isDirty: boolean
  isPersisted: boolean
}) => {
  if (isSaving) {
    return (
      <Group gap={6}>
        <Loader size={16} />
        <Text size="sm">Lagrer…</Text>
      </Group>
    )
  }

  if (isDirty) {
    return (
      <Group gap={6}>
        <IconAlertCircle size={16} color="var(--mantine-color-yellow-7)" />
        <Text size="sm" c="yellow.7">
          Ulagrede endringer
        </Text>
      </Group>
    )
  }

  if (!isPersisted) {
    return (
      <Group gap={6}>
        <IconAlertCircle size={16} color="var(--mantine-color-yellow-7)" />
        <Text size="sm" c="yellow.7">
          Legg til et spørsmål for å lagre skjemaet
        </Text>
      </Group>
    )
  }

  return (
    <Group gap={6}>
      <IconCheck size={16} color="var(--mantine-color-green-6)" />
      <Text size="sm">Lagret</Text>
    </Group>
  )
}

interface QuestionCardProps {
  index: number
  control: Control<FormInput, unknown, FormValues>
  fieldId: string
  onRemove(index: number): void
  onSave(): void
  hasAnswers: boolean
  readOnly?: boolean
}

const QuestionCard = React.memo(function QuestionCard({
  index,
  onRemove,
  onSave,
  control,
  fieldId,
  hasAnswers,
  readOnly,
}: QuestionCardProps) {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<FormInput, unknown, FormValues>()

  const type = useWatch({
    control,
    name: `questions.${index}.type`,
  })

  const optionsError = errors.questions?.[index]?.options
  const optionsErrorMessage =
    optionsError && "message" in optionsError && typeof optionsError.message === "string"
      ? optionsError.message
      : undefined

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
              <Group align="flex-end">
                <Controller
                  name={`questions.${index}.label`}
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Spørsmål"
                      {...field}
                      disabled={readOnly}
                      onBlur={() => {
                        field.onBlur()
                        void onSave()
                      }}
                    />
                  )}
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
                        disabled={hasAnswers || readOnly}
                        {...field}
                        onChange={(value) => {
                          field.onChange(value)
                          if (value !== "SELECT" && value !== "MULTISELECT") {
                            setValue(`questions.${index}.options`, [])
                          }
                          void onSave()
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
                      styles={{
                        input: {
                          borderColor: "var(--mantine-color-gray-6)",
                        },
                      }}
                      checked={field.value}
                      disabled={readOnly}
                      onChange={(e) => {
                        field.onChange(e.currentTarget.checked)
                        void onSave()
                      }}
                    />
                  )}
                />
                <Controller
                  name={`questions.${index}.showInPublicResults`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label="Vis til bedrift"
                      styles={{
                        input: {
                          borderColor: "var(--mantine-color-gray-6)",
                        },
                      }}
                      checked={field.value}
                      disabled={readOnly}
                      onChange={(e) => {
                        field.onChange(e.currentTarget.checked)
                        void onSave()
                      }}
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
                        error={optionsErrorMessage}
                        disabled={readOnly}
                        onChange={(values) => {
                          field.onChange(values.map((name) => field.value.find((opt) => opt.name === name) ?? { name }))
                          void onSave()
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>

            <Group gap={4} mb={"auto"} ml={"auto"}>
              <Tooltip disabled={!hasAnswers} label="Dette spørsmålet har blitt besvart og kan ikke slettes">
                <Button color="red" variant="light" onClick={() => onRemove(index)} disabled={hasAnswers || readOnly}>
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
