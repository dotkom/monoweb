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
import { Control, Controller, FieldValue } from "react-hook-form"
import React, { ComponentPropsWithoutRef, FC } from "react"

export type ControlledSelectProps = {
  control: Control
  name: FieldValue
  placeholder: string
  options: ComponentPropsWithoutRef<SelectItem>[]
}

export const ControlledSelect: FC<ControlledSelectProps> = ({ control, name, placeholder, options }) => {
  return (
    <Controller
      render={({ field }) => (
        <Select defaultValue={field.value} onValueChange={field.onChange}>
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
