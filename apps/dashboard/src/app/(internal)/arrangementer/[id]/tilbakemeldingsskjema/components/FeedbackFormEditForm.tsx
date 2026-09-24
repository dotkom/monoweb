import { CheckboxField } from "@/components/forms/CheckboxField"
import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { FieldShell } from "@/components/forms/FieldShell"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { env } from "@/lib/env"
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
import {
  Button,
  TagInput,
  Text,
  TextInput,
  TextLink,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { DragDropContext, Draggable, type DropResult, Droppable } from "@hello-pangea/dnd"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { useDeleteFeedbackFormMutation } from "../../../mutations"
import { useEventFeedbackPublicResultsTokenGetQuery, useFeedbackAnswersGetQuery } from "../../../queries"

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

  const savingRef = useRef(false)
  const queuedSaveRef = useRef(false)
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

    if (savingRef.current) {
      queuedSaveRef.current = true
      return
    }

    savingRef.current = true
    queuedSaveRef.current = false
    setIsSaving(true)

    void form
      .handleSubmit(async (values) => {
        const saved = await onSave(
          values.feedbackForm,
          values.questions.map((question, index) => ({ ...question, order: index }))
        )
        setIsPersisted(true)
        if (!queuedSaveRef.current) {
          form.reset(toFeedbackFormValues(saved))
        }
      })()
      .finally(() => {
        savingRef.current = false
        setIsSaving(false)
        if (queuedSaveRef.current) {
          save()
        }
      })
  }, [form, onSave, readOnly])

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
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
    if (destination === null || destination.index === source.index) {
      return
    }
    move(source.index, destination.index)
    save()
  }

  const formAnswers = useFeedbackAnswersGetQuery(feedbackFormId ?? skipToken)
  const hasFormAnswers = (formAnswers.data?.length ?? 0) > 0
  const answeredQuestionIds = new Set(formAnswers.data?.flatMap((a) => a.questionAnswers.map((qa) => qa.questionId)))

  const deleteFormMutation = useDeleteFeedbackFormMutation()
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)

  const resultsPageUrl = new URL(`tilbakemelding/${eventId}/svar/`, env.NEXT_PUBLIC_WEB_URL)
  const publicResultsPageUrl = new URL(`${publicResultsTokenQuery.data}`, resultsPageUrl)
  const previewPageUrl = new URL(`tilbakemelding/${eventId}`, env.NEXT_PUBLIC_WEB_URL)
  previewPageUrl.searchParams.append("preview", "true")

  const questionsError =
    typeof form.formState.errors.questions?.message === "string" ? form.formState.errors.questions.message : undefined

  const { isDirty } = form.formState

  return (
    <div className="flex flex-col gap-4">
      {feedbackFormId && (
        <div className="flex flex-col gap-4">
          <Title element="h3" size="sm">
            Svar
          </Title>
          <CopyLinkRow
            url={resultsPageUrl.toString()}
            label="Privat lenke"
            info="Alle svar. Krever innlogging som administrator. Ikke del med bedrifter."
          />

          {publicResultsTokenQuery?.data && (
            <CopyLinkRow
              url={publicResultsPageUrl.toString()}
              label="Bedriftslenke"
              info='Viser kun svar markert med "Vis til bedrift". Alle med lenken kan se dem.'
            />
          )}
        </div>
      )}

      <hr />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <Title element="h3" size="sm">
            Rediger
          </Title>
          <SaveStatus isSaving={isSaving} isDirty={isDirty} isPersisted={isPersisted} />
        </div>
        <Text className="text-sm">Endringer lagres automatisk når du går ut av et felt.</Text>
      </div>

      {feedbackFormId && (
        <TextLink
          href={previewPageUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1"
        >
          Se forhåndsvisning
          <IconExternalLink size={14} />
        </TextLink>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <div className="flex flex-col gap-4">
            <DateTimePickerField
              control={form.control}
              name="feedbackForm.answerDeadline"
              label="Svarfrist"
              description="Brukere som ikke har svart på skjemaet innen svarfristen vil få 2 prikker."
              disabled={readOnly}
              onValueChange={() => {
                save()
              }}
            />

            <div className="mt-4">
              <Button type="button" variant="default" onClick={addQuestion} disabled={readOnly}>
                Legg til spørsmål
              </Button>
            </div>
            <hr />
            <div className="rounded-md border p-4">
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
                      {fields.length === 0 && <Text className="text-red-600">Ingen spørsmål lagt til</Text>}
                      {questionsError && fields.length > 0 && (
                        <Text className="text-sm text-red-600">{questionsError}</Text>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            {feedbackFormId && (
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteFormOpen(true)}
                        disabled={hasFormAnswers || readOnly}
                        icon={<IconTrash className="size-3.5" />}
                      >
                        Slett
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {hasFormAnswers && <TooltipContent>Skjemaet har mottatt svar og kan ikke slettes</TooltipContent>}
                </Tooltip>
              </div>
            )}
          </div>
        </form>
      </FormProvider>
      <ConfirmDeleteModal
        open={deleteFormOpen}
        onOpenChange={setDeleteFormOpen}
        title="Slett tilbakemeldingsskjema"
        description="Er du sikker på at du vil slette tilbakemeldingsskjemaet?"
        onConfirm={() => {
          if (feedbackFormId) {
            deleteFormMutation.mutate(feedbackFormId)
          }
          setDeleteFormOpen(false)
        }}
      />
    </div>
  )
}

function CopyLinkRow({ url, label, info }: { url: string; label: string; info: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex max-w-[600px] flex-col gap-1">
      <TextLink
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium"
      >
        {label}
        <IconExternalLink size={14} />
      </TextLink>
      <Text className="text-sm text-muted-foreground">{info}</Text>
      <div className="flex gap-2">
        <TextInput value={url} readOnly className="w-full" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                void navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? <IconCheck className="size-4 text-green-600" /> : <IconCopy className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Kopiert" : "Kopier"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

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
      <div className="flex items-center gap-1.5">
        <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <Text className="text-sm">Lagrer…</Text>
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className="flex items-center gap-1.5">
        <IconAlertCircle size={16} className="text-yellow-700" />
        <Text className="text-sm text-yellow-700">Ulagrede endringer</Text>
      </div>
    )
  }

  if (!isPersisted) {
    return (
      <div className="flex items-center gap-1.5">
        <IconAlertCircle size={16} className="text-yellow-700" />
        <Text className="text-sm text-yellow-700">Legg til et spørsmål for å lagre skjemaet</Text>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconCheck size={16} className="text-green-600" />
      <Text className="text-sm">Lagret</Text>
    </div>
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

  useEffect(() => {
    if (type !== "SELECT" && type !== "MULTISELECT") {
      setValue(`questions.${index}.options`, [])
    }
  }, [index, setValue, type])

  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  const hasHandledType = useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: i dont care
  useEffect(() => {
    if (!hasHandledType.current) {
      hasHandledType.current = true
      return
    }

    onSaveRef.current()
  }, [type])

  const optionsError = errors.questions?.[index]?.options
  const optionsErrorMessage =
    optionsError && "message" in optionsError && typeof optionsError.message === "string"
      ? optionsError.message
      : undefined

  return (
    <Draggable index={index} draggableId={fieldId}>
      {(provided) => (
        <div className="mb-6 rounded-md border p-4" ref={provided.innerRef} {...provided.draggableProps}>
          <div className="flex flex-nowrap gap-4">
            <div {...provided.dragHandleProps}>
              <IconGripVertical className="cursor-grab" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-end gap-4">
                <TextField
                  fixedWidth
                  control={control}
                  name={`questions.${index}.label`}
                  label="Spørsmål"
                  disabled={readOnly}
                  onBlur={() => {
                    onSave()
                  }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SelectField
                        fixedWidth
                        control={control}
                        name={`questions.${index}.type`}
                        label="Type"
                        required
                        disabled={hasAnswers || readOnly}
                        options={typeOptions}
                      />
                    </div>
                  </TooltipTrigger>
                  {hasAnswers && (
                    <TooltipContent>Typen kan ikke endres fordi spørsmålet har blitt besvart</TooltipContent>
                  )}
                </Tooltip>
                <CheckboxField
                  className="w-fit"
                  control={control}
                  name={`questions.${index}.required`}
                  label="Obligatorisk"
                  disabled={readOnly}
                  onCheckedChange={() => {
                    onSave()
                  }}
                />
                <CheckboxField
                  className="w-fit"
                  control={control}
                  name={`questions.${index}.showInPublicResults`}
                  label="Vis til bedrift"
                  disabled={readOnly}
                  onCheckedChange={() => {
                    onSave()
                  }}
                />
              </div>
              {(type === "SELECT" || type === "MULTISELECT") && (
                <Controller
                  name={`questions.${index}.options`}
                  control={control}
                  render={({ field }) => (
                    <FieldShell id={`questions.${index}.options`} label="Alternativer" error={optionsErrorMessage}>
                      <TagInput
                        id={`questions.${index}.options`}
                        data={field.value.map((option) => option.name)}
                        value={field.value.map((option) => option.name)}
                        disabled={readOnly}
                        invalid={Boolean(optionsErrorMessage)}
                        onChange={(values) => {
                          field.onChange(
                            values.map(
                              (name) =>
                                field.value.find((option) => option.name === name) ?? { id: crypto.randomUUID(), name }
                            )
                          )
                          onSave()
                        }}
                      />
                    </FieldShell>
                  )}
                />
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(index)}
                    disabled={hasAnswers || readOnly}
                  >
                    <IconTrash />
                  </Button>
                </span>
              </TooltipTrigger>
              {hasAnswers && <TooltipContent>Dette spørsmålet har blitt besvart og kan ikke slettes</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      )}
    </Draggable>
  )
})
