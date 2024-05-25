import type { Extras, ExtrasChoices } from "@dotkomonline/types"
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, Button } from "@dotkomonline/ui"
// https://react-hook-form.com/docs/usefieldarray
import { useFieldArray, useForm } from "react-hook-form"

interface Props {
  open: boolean
  extras: Extras[]
  onSubmit: (choices: ExtrasChoices) => void
  setOpen: (open: boolean) => void
  choices: ExtrasChoices | null
}
export function ChooseExtrasDialog({ open, extras, onSubmit, setOpen, choices }: Props) {
  const defaultValues: FormValues | undefined = choices
    ? {
        choices: choices.map((choice) => ({
          choiceId: choice.choiceId,
          questionId: choice.questionId,
          questionName: extras.find((e) => e.id === choice.questionId)?.name ?? "",
          choiceName: choice.choiceName,
        })),
      }
    : undefined
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent>
        <h4>Dette arrangementet har valg.</h4>
        <Form extras={extras} onSubmit={onSubmit} defaultValues={defaultValues} />
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
  extras: Extras[]
  onSubmit: (choices: ExtrasChoices) => void
  defaultValues?: FormValues
}
export default function Form({ extras, onSubmit, defaultValues }: FormProps) {
  console.log(defaultValues)
  const defaultValues_: FormValues = defaultValues ?? {
    choices: extras.map((extra) => ({
      questionId: extra.id,
      choiceId: extra.choices[0].id,
      choiceName: extra.choices[0].name,
      questionName: extra.name,
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

  const _onSubmit = (data: FormValues) => {
    const choices: ExtrasChoices = data.choices.map((extra) => ({
      choiceId: extra.choiceId,
      questionId: extra.questionId,
      questionName: extra.questionName,
      choiceName:
        extras.find((e) => e.id === extra.questionId)?.choices.find((c) => c.id === extra.choiceId)?.name ?? "",
    }))

    onSubmit(choices)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(_onSubmit)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <label htmlFor={`extras[${index}].choiceId`}>{field.questionName}</label>
              <select
                {...register(`choices.${index}.choiceId` as const, {
                  required: true,
                })}
                className="block mt-1 mb-2"
              >
                {extras[index].choices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.name}
                  </option>
                ))}
              </select>
            </div>
          )
        })}

        <Button type="submit">Send inn</Button>
      </form>
    </div>
  )
}
