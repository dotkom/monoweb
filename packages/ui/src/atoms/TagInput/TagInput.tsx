"use client"

import { cn } from "#lib/utils"
import { useState } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "../Combobox/Combobox"

type TagInputProps = {
  data: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  required?: boolean
  creatable?: boolean
}

export function TagInput({
  data,
  value,
  onChange,
  placeholder,
  disabled,
  id,
  className,
  required,
  creatable = true,
}: TagInputProps) {
  const anchor = useComboboxAnchor()
  const [query, setQuery] = useState("")

  const trimmedQuery = query.trim()
  const suggestions = data.filter((tag) => !value.includes(tag))
  const canCreate =
    creatable && trimmedQuery.length > 0 && !value.includes(trimmedQuery) && !suggestions.includes(trimmedQuery)

  return (
    <Combobox
      id={id}
      multiple
      disabled={disabled}
      required={required}
      items={canCreate ? [...suggestions, trimmedQuery] : suggestions}
      value={value}
      onValueChange={(next) => {
        onChange(next)
        setQuery("")
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      autoHighlight
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(tags: string[]) => (
            <>
              {tags.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput id={id} placeholder={tags.length === 0 ? placeholder : undefined} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor} className="data-empty:hidden">
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item === trimmedQuery && canCreate ? `Trykk Enter for å legge til «${item}»` : item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
