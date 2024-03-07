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
import { Control, Controller, FieldValue, FieldValues } from "react-hook-form"
import React, { ComponentPropsWithoutRef } from "react"

export type ControlledSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldValue<TFieldValues>
  placeholder: string
  options: ComponentPropsWithoutRef<typeof SelectItem>[]
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
