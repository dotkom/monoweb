"use client"

import { Button, Text, cn } from "@dotkomonline/ui"
import { IconTrash, IconX } from "@tabler/icons-react"

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
          variant="ghost"
          key={chip.key}
          onClick={chip.onRemove}
          iconRight={<IconX />}
          className={cn(
            "rounded-full",
            "bg-blue-100 dark:bg-sky-950",
            "text-blue-900 hover:text-blue-900 dark:text-sky-200 dark:hover:text-sky-200",
            "hover:bg-blue-200 dark:hover:bg-sky-900"
          )}
        >
          <Text element="span">{chip.label}</Text>
        </Button>
      ))}

      <Button onClick={onResetAll} variant="secondary" className="rounded-full">
        <IconTrash className="size-4" />
        Fjern alle
      </Button>
    </div>
  )
}
