"use client"

import { cn, TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useDebounce } from "use-debounce"

interface SearchInputProps {
  initialValue: string
  onDebouncedChange: (value: string) => void
  placeholder?: string
  className?: string
  containerClassName?: string
}

export const SearchInput = ({
  initialValue,
  onDebouncedChange,
  placeholder = "Søk etter arrangementer...",
  className,
  containerClassName,
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(initialValue)
  const [debouncedValue] = useDebounce(localValue, 300)
  const lastEmittedValueRef = useRef(initialValue)

  // biome-ignore lint/correctness/useExhaustiveDependencies: should only rerender on debouncedValue change
  useEffect(() => {
    if (debouncedValue !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = debouncedValue
      onDebouncedChange(debouncedValue)
    }
  }, [debouncedValue])

  // sync with external changes only if they differ from what was last emitted
  useEffect(() => {
    if (initialValue !== lastEmittedValueRef.current) {
      setLocalValue(initialValue)
      lastEmittedValueRef.current = initialValue
    }
  }, [initialValue])

  return (
    <div className={cn("relative", className)}>
      <IconSearch className="w-6.5 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-2.5" />
      <TextInput
        containerClassName={cn("h-12 sm:h-full", containerClassName)}
        className="pl-8 py-2 h-full"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  )
}
