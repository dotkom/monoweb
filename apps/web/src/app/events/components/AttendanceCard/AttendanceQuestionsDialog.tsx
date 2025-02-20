import { AttendanceQuestion, AttendanceQuestionResponse } from "@dotkomonline/types"
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@dotkomonline/ui"
import { useFieldArray, useForm } from "react-hook-form"

interface AttendanceQuestionsDialog {
  open: boolean
  questions: AttendanceQuestion[]
  onSubmit: (choices: AttendanceQuestionResponse[]) => void
  setOpen: (open: boolean) => void
  defaultValues: AttendanceQuestionResponse[]
}

export function AttendanceQuestionsDialog({ open, questions, onSubmit, setOpen, defaultValues }: AttendanceQuestionsDialog) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent>
        <h4>Dette arrangementet har valg.</h4>
        <Form
          questions={questions}
          onSubmit={onSubmit}
          defaultValues={defaultValues ? { choices: defaultValues } : undefined}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

type FormValues = {
  choices: {
    choiceName: string
    questionId: string
    questionName: string
    choiceId: string
  }[]
}

interface FormProps {
  questions: AttendanceQuestion[]
  onSubmit: (choices: AttendanceQuestionResponse[]) => void
  defaultValues?: FormValues
}
export default function Form({ questions: responses, onSubmit, defaultValues }: FormProps) {
  const defaultValues_: FormValues = defaultValues ?? {
    choices: responses.map((question) => ({
      questionId: question.id,
      choiceId: question.choices[0].id,
      choiceName: question.choices[0].name,
      questionName: question.name,
    })),
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultValues_, mode: "onBlur" })

  const { fields } = useFieldArray({
    name: "choices",
    control,
  })

  const onSubmit_ = (data: FormValues) => {
    const choices = data.choices.map((question) => ({
      ...question,
      choiceName:
        responses.find((e) => e.id === question.questionId)?.choices.find((c) => c.id === question.choiceId)?.name ?? "",
    }))

    onSubmit(choices)
  }

  return (
    <div>
      <form onChange={handleSubmit(onSubmit_)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="w-full">
              <label className="font-bold" htmlFor={`questions[${index}].choiceId`}>
                {field.questionName}
              </label>
              <div className="w-full bg-[#fff] p-[0.5px]">
                <select
                  {...register(`choices.${index}.choiceId` as const, {
                    required: true,
                  })}
                  className="block mt-1 mb-2 w-full text-xl"
                >
                  {responses[index].choices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </form>
    </div>
  )
}
