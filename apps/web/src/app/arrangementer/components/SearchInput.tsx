"use client"

import { TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useDebounce } from "use-debounce"

interface SearchInputProps {
  initialValue: string
  onDebouncedChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SearchInput = ({
  initialValue,
  onDebouncedChange,
  placeholder = "Søk etter arrangementer...",
  className,
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
    <div className={className}>
      <IconSearch
        className="w-8 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3"
      />
      <TextInput
        className="pl-10 w-full h-[2.875rem] dark:border-none text-base sm:text-sm"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  )
}
