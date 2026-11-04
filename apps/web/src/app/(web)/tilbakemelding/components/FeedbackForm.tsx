"use client"

import type { Attendee } from "@dotkomonline/rpc/attendance"
import type { FeedbackForm, FeedbackQuestion, FeedbackQuestionAnswer } from "@dotkomonline/rpc/feedback-form"
import {
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextInput,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@dotkomonline/ui"
import { IconLoader } from "@tabler/icons-react"
import React, { useRef, useState } from "react"
import { type Control, Controller, type FieldErrors, useController, useForm } from "react-hook-form"
import { useCreateFeedbackAnswerMutation } from "../mutations"

interface FormValues {
  answers: FeedbackQuestionAnswer[]
}

interface FormProps {
  feedbackForm: FeedbackForm
  attendee?: Attendee
  preview: boolean
}

export function EventFeedbackForm({ feedbackForm, attendee, preview }: FormProps) {
  const [submitted, setSubmitted] = useState(false)

  const feedbackAnswerCreateMutation = useCreateFeedbackAnswerMutation({ onSuccess: () => setSubmitted(true) })

  const sortedQuestions = feedbackForm.questions.toSorted((a, b) => a.order - b.order)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      answers: sortedQuestions.map((q) => ({
        questionId: q.id,
        value: null,
        selectedOptions: [],
      })),
    },
  })

  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  const onError = (errors: FieldErrors<FormValues>) => {
    const firstInvalidIndex = errors?.answers?.findIndex?.(Boolean)
    if (firstInvalidIndex != null && firstInvalidIndex >= 0) {
      questionRefs.current[firstInvalidIndex]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const onSubmit = (values: FormValues) => {
    if (!attendee || preview) {
      throw new Error("Can't submit in preview mode")
    }

    const answers = values.answers.map((answer) => {
      return {
        questionId: answer.questionId,
        value: answer.value,
        selectedOptions: answer.selectedOptions,
      }
    })

    feedbackAnswerCreateMutation.mutate({
      formAnswer: {
        attendeeId: attendee.id,
        feedbackFormId: feedbackForm.id,
      },
      questionAnswers: answers,
    })
  }

  if (submitted) {
    return <Text>Tilbakemelding registrert</Text>
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit, onError)}>
      <FieldGroup className="flex flex-col gap-8">
        {sortedQuestions.map((question, index) => {
          return (
            <QuestionField
              key={question.id}
              question={question}
              index={index}
              control={control}
              errors={errors}
              ref={(el) => {
                questionRefs.current[index] = el
              }}
            />
          )
        })}
      </FieldGroup>

      {preview ? (
        <Popover>
          <PopoverTrigger asChild nativeButton={false} openOnHover delay={0}>
            <span className="inline-flex w-fit">
              <Button variant="default" disabled>
                Send inn tilbakemelding
              </Button>
            </span>
          </PopoverTrigger>
          <PopoverContent side="top">
            <Text>Du kan ikke sende inn tilbakemeldingen i forhåndsvisning.</Text>
          </PopoverContent>
        </Popover>
      ) : (
        <Button type="submit" variant="default" className="w-fit" disabled={feedbackAnswerCreateMutation.isPending}>
          {feedbackAnswerCreateMutation.isPending && <IconLoader className="animate-spin size-4" />}
          Send inn tilbakemelding
        </Button>
      )}
    </form>
  )
}

interface Props {
  question: FeedbackQuestion
  index: number
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
}

const QuestionField = React.forwardRef<HTMLDivElement, Props>(({ question, index, control, errors }, ref) => {
  const questionInput = (() => {
    switch (question.type) {
      case "TEXT":
        return <TextQuestion control={control} index={index} question={question} />
      case "LONGTEXT":
        return <LongTextQuestion control={control} index={index} question={question} />
      case "CHECKBOX":
        return <CheckboxQuestion control={control} index={index} question={question} />
      case "SELECT":
        return <SelectQuestion control={control} index={index} question={question} />
      case "MULTISELECT":
        return <MultiSelectQuestion control={control} index={index} question={question} />
      case "RATING":
        return <RatingQuestion control={control} index={index} question={question} />
    }
  })()

  const hasErrors = Boolean(errors.answers?.[index])

  const name =
    question.type === "SELECT" || question.type === "MULTISELECT"
      ? (`answers.${index}.selectedOptions` as const)
      : (`answers.${index}.value` as const)

  const { fieldState } = useController({ control, name })

  return (
    <Field data-invalid={hasErrors ? true : undefined} ref={ref}>
      <FieldContent>
        <FieldLabel id={`${question.id}-label`} htmlFor={question.id} className="block">
          <RequiredLabel label={question.label} required={question.required} />
        </FieldLabel>
      </FieldContent>
      {questionInput}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  )
})

interface QuestionProps {
  question: FeedbackQuestion
  index: number
  control: Control<FormValues>
}

const TextQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    rules={{
      validate: (value) =>
        !question.required || (typeof value === "string" && value.trim() !== "")
          ? true
          : "Dette spørsmålet er obligatorisk",
    }}
    render={({ field: { onChange, value } }) => (
      <TextInput
        id={question.id}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        placeholder="Svaret ditt"
      />
    )}
  />
)

const LongTextQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    rules={{
      validate: (value) =>
        !question.required || (typeof value === "string" && value.trim() !== "")
          ? true
          : "Dette spørsmålet er obligatorisk",
    }}
    render={({ field: { onChange, value } }) => (
      <Textarea
        id={question.id}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        placeholder="Svaret ditt"
      />
    )}
  />
)

const CheckboxQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    rules={{
      validate: (value) =>
        !question.required || (typeof value === "boolean" && value) ? true : "Dette spørsmålet er obligatorisk",
    }}
    render={({ field: { onChange, value } }) => (
      <Checkbox checked={!!value} id={question.id} onCheckedChange={onChange} label="Ja" />
    )}
  />
)

const SelectQuestion = ({ question, index, control }: QuestionProps) => {
  const selectItems = [
    ...(!question.required ? [{ value: "0", label: "Fjern valg" }] : []),
    ...question.options.map((option) => ({ value: option.id, label: option.name })),
  ]
  const { field } = useController({ control, name: `answers.${index}.selectedOptions` })
  const currentlySelectedOptionId = field.value?.at(0)?.id

  return (
    <Controller
      control={control}
      name={`answers.${index}.selectedOptions`}
      rules={{
        validate: (val) => (!question.required || val?.length > 0 ? true : "Du må velge et alternativ"),
      }}
      render={({ field: { onChange, value } }) => (
        <Select
          value={value?.[0]?.id ?? ""}
          name={question.id}
          onValueChange={(id) => {
            const selectedOption = question.options.find((o) => o.id === id)
            if (selectedOption !== undefined && selectedOption.id === currentlySelectedOptionId) {
              onChange(null)
            } else {
              onChange([selectedOption])
            }
          }}
          items={selectItems}
        >
          <SelectTrigger className="w-full transition-all" id={question.id}>
            <SelectValue placeholder="Velg et alternativ" className="transition-all" />
          </SelectTrigger>
          <SelectContent>
            {!question.required && (
              <SelectItem value="0">
                <Text className="text-gray-500 text-xs font-medium">Fjern valg</Text>
              </SelectItem>
            )}
            {question.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}

const RATING_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

const RatingQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    rules={{
      validate: (val) =>
        !question.required || (typeof val === "number" && val > 0) ? true : "Du må velge et alternativ",
    }}
    render={({ field: { onChange, value } }) => (
      <ToggleGroup
        aria-labelledby={`${question.id}-label`}
        aria-required={question.required || undefined}
        multiple={false}
        spacing={0}
        variant="outline"
        size="lg"
        className="w-full min-w-0 grid grid-cols-5 sm:grid-cols-10 overflow-hidden border border-input rounded-lg"
        value={value == null ? [] : [String(value)]}
        onValueChange={(next) => {
          const nextValue = next.at(0)

          if (nextValue !== undefined) {
            onChange(Number(nextValue))
            return
          }

          if (!question.required) {
            onChange(null)
          }
        }}
      >
        {RATING_SCALE.map((n) => (
          <ToggleGroupItem
            key={n}
            value={n.toString()}
            className={cn(
              "min-w-0 rounded-none border-y-0 px-0 tabular-nums",
              "first:rounded-none! first:border-l-0! last:rounded-none last:border-r-0",
              "focus-visible:z-10 focus-visible:ring-inset",
              "max-sm:nth-[-n+5]:border-b max-sm:nth-5:border-r-0 sm:nth-5:border-r"
            )}
          >
            {n}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )}
  />
)

const MultiSelectQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.selectedOptions`}
    rules={{
      validate: (val) => (!question.required || val?.length > 0 ? true : "Du må velge minst ett alternativ"),
    }}
    render={({ field: { value = [], onChange } }) => (
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const isChecked = value.map((v) => v.id).includes(option.id)
          return (
            <div key={option.id} className="flex flex-row gap-2 items-center">
              <Checkbox
                id={option.id}
                checked={isChecked}
                label={option.name}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...value, option])
                  } else {
                    onChange(value.filter((selectedOption) => selectedOption.id !== option.id))
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    )}
  />
)

function RequiredLabel({ label, required }: { label: string; required: boolean }) {
  if (!required) {
    return label
  }

  const lastSpace = label.lastIndexOf(" ")
  const firstPart = lastSpace === -1 ? "" : label.slice(0, lastSpace + 1)
  const lastWord = lastSpace === -1 ? label : label.slice(lastSpace + 1)

  return (
    <>
      {firstPart}
      <span className="whitespace-nowrap">
        {lastWord}
        <span className="text-destructive"> *</span>
      </span>
    </>
  )
}
