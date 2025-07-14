"use client"

import type { Attendee, FeedbackForm, FeedbackQuestion, FeedbackQuestionAnswer } from "@dotkomonline/types"
import {
  Button,
  Checkbox,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextInput,
  Textarea,
} from "@dotkomonline/ui"
import clsx from "clsx"
import React, { type ReactNode, useRef, useState } from "react"
import { type Control, Controller, type FieldErrors, useForm } from "react-hook-form"
import { useCreateFeedbackAnswerMutation } from "../mutations"

interface FormValues {
  answers: FeedbackQuestionAnswer[]
}

interface FormProps {
  feedbackForm: FeedbackForm
  attendee: Attendee
}

export function EventFeedbackForm({ feedbackForm, attendee }: FormProps) {
  const [submitted, setSubmitted] = useState(false)

  const feedbackAnswerCreateMutation = useCreateFeedbackAnswerMutation({ onSuccess: () => setSubmitted(true) })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      answers: feedbackForm.questions.map((q) => ({
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

  const sortedQuestions = feedbackForm.questions.sort((a, b) => a.order - b.order)

  if (submitted) {
    return <Text>Tilbakemelding registrert</Text>
  }

  return (
    <form className="flex flex-col gap-4 max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit, onError)}>
      {sortedQuestions.map((question, index) => {
        return (
          <QuestionCard
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
      <Button type="submit" color="brand">
        Send inn
      </Button>
    </form>
  )
}

interface Props {
  question: FeedbackQuestion
  index: number
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
}

const QuestionCard = React.forwardRef<HTMLDivElement, Props>(({ question, index, control, errors }, ref) => {
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

  return (
    <div ref={ref} className={clsx("shadow-md p-6 rounded-lg border-2", hasErrors ? "border-red-9" : "border-slate-4")}>
      <div className="mb-6">
        <Label htmlFor={question.id} className="text-lg inline dark:text-white break-all">
          {question.label}
          {question.required && <span className="text-red-11 ml-1">*</span>}
        </Label>
      </div>
      {questionInput}
    </div>
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
    render={({ field: { onChange, value }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <TextInput
          id={question.id}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          placeholder="Svaret ditt"
        />
      </InputWrapper>
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
    render={({ field: { onChange, value }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <Textarea
          id={question.id}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          placeholder="Svaret ditt"
          className="text-[16px] "
        />
      </InputWrapper>
    )}
  />
)

const CheckboxQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    render={({ field: { onChange, value }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <Checkbox checked={!!value} id={question.id} onCheckedChange={onChange} />
      </InputWrapper>
    )}
  />
)

const SelectQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.selectedOptions`}
    rules={{
      validate: (val) => (!question.required || val?.length > 0 ? true : "Du må velge et alternativ"),
    }}
    render={({ field: { onChange, value }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <Select
          value={value?.[0]?.id ?? ""}
          name={question.id}
          onValueChange={(id) => onChange([question.options.find((o) => o.id === id)])}
          required={question.required}
        >
          <SelectTrigger className="w-full transition-all bg-white-3" id={question.id}>
            <SelectValue placeholder="Velg et alternativ" className="transition-all" />
          </SelectTrigger>
          <SelectContent>
            {!question.required && (
              <SelectItem value="0">
                <Text className="text-slate-11 text-xs font-medium">Fjern valg</Text>
              </SelectItem>
            )}
            {question.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </InputWrapper>
    )}
  />
)

const RatingQuestion = ({ question, index, control }: QuestionProps) => (
  <Controller
    control={control}
    name={`answers.${index}.value`}
    rules={{
      validate: (val) =>
        !question.required || (typeof val === "number" && val > 0) ? true : "Du må velge et alternativ",
    }}
    render={({ field: { onChange, value }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <RadioGroup className="flex sm:flex-row flex-col gap-2" required={question.required} id={question.id}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Label
              key={`${question.id}.${n}`}
              htmlFor={`${question.id}.${n}`}
              className={clsx(
                "items-center justify-center w-10 h-10 hover:bg-slate-3 dark:hover:bg-slate-11 active:bg-slate-6 dark:active:bg-slate-10 rounded-full border border-slate-8 cursor-pointer",
                Number(value) === n &&
                  "bg-brand-11 text-white hover:bg-brand-9 dark:hover:bg-brand-9 active:bg-brand-10 dark:active:bg-brand-10"
              )}
            >
              <RadioGroupItem
                value={n.toString()}
                id={`${question.id}.${n}`}
                className="hidden"
                onClick={() => {
                  if (!question.required && value === n) {
                    onChange(null)
                  } else {
                    onChange(n)
                  }
                }}
              />
              <Text className="dark:text-white">{n}</Text>
            </Label>
          ))}
        </RadioGroup>
      </InputWrapper>
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
    render={({ field: { value = [], onChange }, fieldState }) => (
      <InputWrapper error={fieldState.error?.message}>
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isChecked = value.map((v) => v.id).includes(option.id)
            return (
              <div key={option.id} className="flex flex-row gap-2 items-center">
                <Checkbox
                  id={option.id}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...value, option])
                    } else {
                      onChange(value.filter((selectedOption) => selectedOption.id !== option.id))
                    }
                  }}
                />
                <Label htmlFor={option.id} className="dark:text-white">
                  {option.name}
                </Label>
              </div>
            )
          })}
        </div>
      </InputWrapper>
    )}
  />
)

const InputWrapper = ({ children, error }: { children: ReactNode; error?: string }) => (
  <div>
    {children}
    {error && (
      <Text className="text-red-9 text-sm mt-2" role="alert">
        {error}
      </Text>
    )}
  </div>
)
