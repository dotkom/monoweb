import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { useCountdown } from "@/utils/countdown/use-countdown"
import type { Attendance, AttendanceSelectionResponse, Attendee } from "@dotkomonline/rpc/attendance"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Stripes,
  Text,
  cn,
} from "@dotkomonline/ui"
import { Controller, useFieldArray, useForm } from "react-hook-form"

interface SelectionsFormValues {
  attendeeOptions: AttendanceSelectionResponse[]
}

interface SelectionsFormProps {
  attendance: Attendance
  attendee: Attendee
  onSubmit: (selections: AttendanceSelectionResponse[]) => void
  disabled?: boolean
}

export function SelectionsForm({ attendance, attendee, onSubmit, disabled }: SelectionsFormProps) {
  const prefilledSelections = attendance.selections.map(({ id: selectionId, name: selectionName }) => {
    const savedResponse = attendee.selections.find((selection) => selection.selectionId === selectionId)
    const optionId = savedResponse?.optionId ?? ""
    const optionName = savedResponse?.optionName ?? ""

    return { selectionId, selectionName, optionId, optionName }
  })

  const {
    control,
    getValues,
    formState: { errors },
  } = useForm<SelectionsFormValues>({
    defaultValues: { attendeeOptions: prefilledSelections },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { fields: attendeeOptionsFields } = useFieldArray({
    name: "attendeeOptions",
    control,
  })

  const hasError = (index: number) => !disabled && Boolean(errors.attendeeOptions?.[index]?.optionId)

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attendeeOptionsFields.map((field, index) => (
          <Controller
            key={field.id}
            control={control}
            name={`attendeeOptions.${index}.optionId`}
            disabled={disabled}
            rules={{ required: "Du må velge et alternativ" }}
            render={({ field: { onChange, value } }) => (
              <div className="w-full flex flex-col gap-1">
                <Select
                  value={value}
                  disabled={disabled}
                  onValueChange={(newValue) => {
                    onChange(newValue)
                    onSubmit(getValues("attendeeOptions"))
                  }}
                  items={attendance.selections[index].options.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  }))}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full transition-all",
                      hasError(index) &&
                        "border-red-600 focus:ring-red-600 focus:border-red-600 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400"
                    )}
                  >
                    <SelectValue
                      placeholder={attendance.selections[index].name}
                      className={cn(
                        "placeholder:text-gray-700 transition-all",
                        hasError(index) && "text-red-600 dark:text-red-400"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-gray-800 dark:text-stone-300 text-xs">
                        {attendance.selections[index].name}
                      </SelectLabel>

                      {attendance.selections[index].options.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {hasError(index) && (
                  <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                    {errors.attendeeOptions?.[index]?.optionId?.message ?? "En feil oppstod"}
                  </Text>
                )}
              </div>
            )}
          />
        ))}
    </section>
  )
}

export function SelectionDeadlineBar({ deadline, reserved }: { deadline: Date; reserved: boolean }) {
  const countdown = useCountdown(deadline, formatRollingCountdown)
  const stripeColorA = reserved ? "bg-amber-200" : "bg-indigo-200"
  const stripeColorB = reserved ? "bg-amber-300" : "bg-indigo-300"

  return (
    <Stripes
      colorA={cn("dark:bg-amber-600", stripeColorA)}
      colorB={cn("dark:bg-amber-700", stripeColorB)}
      stripeWidth={16}
      animated
      className="flex h-5 items-center rounded-md px-1.5 w-fit"
    >
      <Text className="text-sm font-medium" suppressHydrationWarning>
        {countdown}
      </Text>
    </Stripes>
  )
}
