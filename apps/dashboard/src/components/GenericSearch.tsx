import React from "react"
import { Autocomplete } from "@mantine/core"

interface GenericSearchProps<T> {
  onSearch(query: string): void
  onSubmit(item: T): void
  items: T[]
  dataMapper(item: T): string
  placeholder?: string | undefined | null
}

const GenericSearch = <T,>({ onSearch, onSubmit, items, dataMapper, placeholder }: GenericSearchProps<T>) => {
  const handleChange = (value: string) => {
    onSearch(value)

    const selectedItem = items.find((item) => dataMapper(item) === value)
    if (selectedItem) {
      onSubmit(selectedItem)
    }
  }

  const placeholderText = placeholder !== null ? placeholder || "Search..." : undefined

  return (
    <Autocomplete
      data={items.map(dataMapper)}
      onChange={handleChange}
      placeholder={placeholderText}
      className="flex-grow"
    />
  )
}

export default GenericSearch
