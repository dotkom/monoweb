import type { AttendanceSelection, AttendanceSelectionResponse } from "@dotkomonline/types"
import { useFieldArray, useForm } from "react-hook-form"

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
  isLoading?: boolean
}
export default function Form({ selections: responses, onSubmit, defaultValues: submittedDefaultValues }: FormProps) {
  const defaultValues: FormValues = submittedDefaultValues ?? {
    options: responses.map((option) => ({
      selectionId: option.id,
      optionId: option.options[0].id,
      optionName: option.options[0].name,
      selectionName: option.name,
    })),
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, mode: "onBlur" })

  const { fields } = useFieldArray({
    name: "options",
    control,
  })

  const onSubmit_ = (data: FormValues) => {
    onSubmit(data.options)
  }

  return (
    <div>
      <form onChange={handleSubmit(onSubmit_)} className="flex flex-col space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="w-full flex flex-col space-y-1">
            <label className="text-lg text-slate-9" htmlFor={`selections[${index}].optionId`}>
              {field.selectionName}
            </label>
            <div className="w-full bg-slate-3 pr-2 rounded-lg">
              <select
                {...register(`options.${index}.optionId` as const, {
                  required: true,
                })}
                className="w-full bg-slate-3 p-2 rounded-lg text-xl"
              >
                {responses[index].options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </form>
    </div>
  )
}
