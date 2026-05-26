"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
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
          <SelectTrigger className="min-w-25">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-fit">
            {options.map((props) => (
              <SelectItem key={props.value} value={props.value} className="hover:bg-gray-100 focus:bg-gray-100">
                {props.children}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      name={name}
      control={control}
    />
  )
}
