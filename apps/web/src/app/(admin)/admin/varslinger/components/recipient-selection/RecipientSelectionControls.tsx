"use client"

import { Toggle, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { useId } from "react"

export function LabeledToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const controlId = useId()

  return (
    <label htmlFor={controlId} className="flex items-center gap-2 text-sm">
      <Toggle id={controlId} checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  )
}

export function ChoiceGroup<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: TValue
  options: { label: string; value: TValue }[]
  onChange: (value: TValue) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <ToggleGroup
        multiple={false}
        value={[value]}
        onValueChange={(next) => {
          const selected = options.find((option) => option.value === next.at(0))

          if (!selected) {
            return
          }

          onChange(selected.value)
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
