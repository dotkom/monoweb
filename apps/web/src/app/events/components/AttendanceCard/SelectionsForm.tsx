import type { AttendanceSelection, AttendanceSelectionResponse } from "@dotkomonline/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text, cn } from "@dotkomonline/ui"
import { useEffect } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"

interface FormValues {
  options: { optionId: string; selectionId: string }[]
}

interface FormProps {
  selections: AttendanceSelection[]
  onSubmit: (selections: AttendanceSelectionResponse[]) => void
  defaultValues?: FormValues
  isLoading?: boolean
  disabled?: boolean
}

export function SelectionsForm({ selections, onSubmit, defaultValues: submittedDefaults, disabled }: FormProps) {
  const defaultValues: FormValues = {
    options: selections.map((sel) => {
      const saved = submittedDefaults?.options?.find((o) => o.selectionId === sel.id)
      return { selectionId: sel.id, optionId: saved?.optionId ?? "" }
    }),
  }

  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  })

  useEffect(() => {
    trigger()
  }, [trigger])

  const { fields } = useFieldArray({
    name: "options",
    control,
  })

  const submitHandler = () => {
    const options = getValues("options")

    const result = options
      .map(({ optionId }, i) => {
        const selection = selections[i]
        const option = selection.options.find((o) => o.id === optionId)
        return (
          option && {
            optionId: option.id,
            optionName: option.name,
            selectionName: selection.name,
            selectionId: selection.id,
          }
        )
      })
      .filter(Boolean) as AttendanceSelectionResponse[]

    onSubmit(result)
  }

  const hasError = (index: number) => !disabled && Boolean(errors.options?.[index]?.optionId)

  return (
    <div className="flex flex-col gap-4 bg-green-3 p-3 rounded-md">
      {fields.map((field, index) => (
        <div key={field.id} className={cn("w-full flex flex-col gap-2", hasError(index) && "bg-red-2 rounded-md p-2")}>
          <Controller
            control={control}
            name={`options.${index}.optionId`}
            disabled={disabled}
            rules={{ required: "Du må velge et alternativ" }}
            render={({ field: { onChange, value } }) => (
              <div className="w-full flex flex-col gap-1">
                <div className="border border-green-5 bg-green-1 rounded-md">
                  <Select
                    value={value}
                    disabled={disabled}
                    onValueChange={async (val) => {
                      onChange(val)
                      await trigger(`options.${index}.optionId`)
                      submitHandler()
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full transition-all",
                        hasError(index) && "border-red-9 focus:ring-red-9 focus:border-red-9"
                      )}
                    >
                      <SelectValue
                        placeholder={selections[index].name}
                        className={cn(
                          "placeholder:text-slate-8 transition-all",
                          hasError(index) && "text-red-11 placeholder:text-red-9"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={"label"} value={"label"} disabled>
                        <Text className="text-slate-11 text-xs font-medium text-left">{selections[index].name}</Text>
                      </SelectItem>
                      {selections[index].options.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasError(index) && (
                  <Text className="text-red-11 text-xs tracking-wider uppercase font-semibold text-left transition-all fade-in fade-out">
                    {errors.options?.[index]?.optionId?.message}
                  </Text>
                )}
              </div>
            )}
          />
        </div>
      ))}
    </div>
  )
}
