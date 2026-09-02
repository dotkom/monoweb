"use client"

import { Button, Text, cn } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

interface FilterChipsProps {
  chips: FilterChip[]
  onResetAll: () => void
  className?: string
}

export const FilterChips = ({ chips, onResetAll, className }: FilterChipsProps) => {
  if (chips.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 transition duration-500", className)}>
      {chips.map((chip) => (
        <Button
          variant="unstyled"
          key={chip.key}
          onClick={chip.onRemove}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
            "bg-blue-100 dark:bg-sky-950",
            "text-blue-900 dark:text-sky-200",
            "hover:bg-blue-200 dark:hover:bg-sky-900",
            "transition"
          )}
        >
          <Text element="span">{chip.label}</Text>
          <IconX className="size-4" />
        </Button>
      ))}

      <Button onClick={onResetAll} variant="secondary" className="text-sm rounded-full px-3 py-1.5 shadow-none">
        Fjern alle
      </Button>
    </div>
  )
}
