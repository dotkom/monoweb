import React from "react"
import { Autocomplete } from "@mantine/core"

interface GenericSearchProps<T> {
  onSearch(query: string): void
  onSubmit(item: T): void
  items: T[]
  dataMapper(item: T): string
  placeholder?: string | null | undefined
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

  const data = items.map(dataMapper)

  // check for duplicates. If there are duplicates, add a number to the end of the string

  const duplicateMap = new Map<string, number>()

  const dataWithDuplicates = data.map((item) => {
    const count = duplicateMap.get(item) || 0
    duplicateMap.set(item, count + 1)

    if (count === 0) {
      return item
    }

    return `${item} (${count})`
  })

  return (
    <Autocomplete
      data={dataWithDuplicates}
      onChange={handleChange}
      placeholder={placeholderText}
      className="flex-grow"
    />
  )
}

export default GenericSearch
