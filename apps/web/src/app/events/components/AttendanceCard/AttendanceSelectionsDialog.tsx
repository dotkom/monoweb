import type { AttendanceSelection, AttendanceSelectionResponse } from "@dotkomonline/types"
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@dotkomonline/ui"
import { useFieldArray, useForm } from "react-hook-form"

interface AttendanceSelectionsDialog {
  open: boolean
  selections: AttendanceSelection[]
  onSubmit: (options: AttendanceSelectionResponse[]) => void
  setOpen: (open: boolean) => void
  defaultValues: AttendanceSelectionResponse[]
}

export function AttendanceSelectionsDialog({
  open,
  selections,
  onSubmit,
  setOpen,
  defaultValues,
}: AttendanceSelectionsDialog) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent>
        <h4>Dette arrangementet har valg.</h4>
        <Form
          selections={selections}
          onSubmit={onSubmit}
          defaultValues={defaultValues ? { options: defaultValues } : undefined}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

type FormValues = {
  options: {
    optionName: string
    selectionId: string
    selectionName: string
    optionId: string
  }[]
}

interface FormProps {
  selections: AttendanceSelection[]
  onSubmit: (options: AttendanceSelectionResponse[]) => void
  defaultValues?: FormValues
}
export default function Form({ selections: responses, onSubmit, defaultValues }: FormProps) {
  const defaultValues_: FormValues = defaultValues ?? {
    options: responses.map((selection) => ({
      selectionId: selection.id,
      optionId: selection.options[0].id,
      optionName: selection.options[0].name,
      selectionName: selection.name,
    })),
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultValues_, mode: "onBlur" })

  const { fields } = useFieldArray({
    name: "options",
    control,
  })

  const onSubmit_ = (data: FormValues) => {
    const options = data.options.map((selection) => ({
      ...selection,
      optionName:
        responses.find((e) => e.id === selection.selectionId)?.options.find((c) => c.id === selection.optionId)?.name ??
        "",
    }))

    onSubmit(options)
  }

  return (
    <div>
      <form onChange={handleSubmit(onSubmit_)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="w-full">
              <label className="font-bold" htmlFor={`selections[${index}].optionId`}>
                {field.selectionName}
              </label>
              <div className="w-full bg-[#fff] p-[0.5px]">
                <select
                  {...register(`options.${index}.optionId` as const, {
                    required: true,
                  })}
                  className="block mt-1 mb-2 w-full text-xl"
                >
                  {responses[index].options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
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
