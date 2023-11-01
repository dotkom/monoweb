import React from "react"
import { Autocomplete } from "@mantine/core"

interface GenericSearchProps<T> {
  onSearch(query: string): void
  onSubmit(item: T): void
  items: T[]
  dataMapper(item: T): string
}

const GenericSearch = <T,>({ onSearch, onSubmit, items, dataMapper }: GenericSearchProps<T>) => {
  const handleChange = (value: string) => {
    onSearch(value)

    const selectedItem = items.find((item) => dataMapper(item) === value)
    if (selectedItem) {
      onSubmit(selectedItem)
    }
  }

  return (
    <Autocomplete data={items.map(dataMapper)} onChange={handleChange} placeholder="Search..." className="flex-grow" />
  )
}

export default GenericSearch
