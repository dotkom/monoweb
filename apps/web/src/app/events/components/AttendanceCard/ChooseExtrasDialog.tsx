import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"
import type { Extras, ExtrasChoices } from "@dotkomonline/types"
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, Button, Select } from "@dotkomonline/ui"
import { useFieldArray, useForm } from "react-hook-form"

interface Props {
  open: boolean
  extras: Extras[]
  onSubmit: (choices: ExtrasChoices) => void
  setOpen: (open: boolean) => void
  defaultValues: ExtrasChoices | null
}
export function ChooseExtrasDialog({ open, extras, onSubmit, setOpen, defaultValues }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent>
        <h4>Dette arrangementet har valg.</h4>
        <Form
          extras={extras}
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
  extras: Extras[]
  onSubmit: (choices: ExtrasChoices) => void
  defaultValues?: FormValues
}
export default function Form({ extras, onSubmit, defaultValues }: FormProps) {
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

  const onSubmit_ = (data: FormValues) => {
    const choices: ExtrasChoices = data.choices.map((extra) => ({
      ...extra,
      choiceName:
        extras.find((e) => e.id === extra.questionId)?.choices.find((c) => c.id === extra.choiceId)?.name ?? "",
    }))

    onSubmit(choices)
  }

  return (
    <div>
      <form onChange={handleSubmit(onSubmit_)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="w-full">
              <label className="font-bold" htmlFor={`extras[${index}].choiceId`}>{field.questionName}</label>
              <div className="w-full bg-[#fff] p-[0.5px]">
                <select
                  {...register(`choices.${index}.choiceId` as const, {
                    required: true,
                  })}
                  className="block mt-1 mb-2 w-full text-xl"
                >
                  {extras[index].choices.map((choice) => (
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
