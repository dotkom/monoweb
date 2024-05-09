import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@dotkomonline/ui"
import type { ComponentPropsWithoutRef } from "react"
import { type Control, Controller, type FieldValue, type FieldValues } from "react-hook-form"

export type ControlledSelectProps<TFieldValues extends FieldValues> = {
  readonly control: Control<TFieldValues>
  readonly name: FieldValue<TFieldValues>
  placeholder: string
  readonly options: ComponentPropsWithoutRef<typeof SelectItem>[]
}

export function ControlledSelect<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  options,
}: ControlledSelectProps<TFieldValues>) {
  return (
    <Controller
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
            <SelectIcon />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectScrollUpButton />
              <SelectViewport>
                {options.map((props) => (
                  <SelectItem key={props.value} {...props} />
                ))}
              </SelectViewport>
              <SelectScrollDownButton />
            </SelectContent>
          </SelectPortal>
        </Select>
      )}
      name={name}
      control={control}
    />
  )
}
