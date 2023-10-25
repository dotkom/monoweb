import React, { FC } from "react"
import { Autocomplete } from "@mantine/core"

interface GenericSearchProps {
  onSearch: (query: string) => void
  onSubmit: (item: any) => void
  items: any[]
  dataMapper: (item: any) => string
}

const GenericSearch: FC<GenericSearchProps> = ({ onSearch, onSubmit, items, dataMapper }) => {
  const handleChange = (value: string) => {
    if (value !== "") {
      onSearch(value)

      const selectedItem = items.find((item) => dataMapper(item) === value)
      if (selectedItem) {
        onSubmit(selectedItem)
      }
    }
  }

  return (
    <Autocomplete data={items.map(dataMapper)} onChange={handleChange} placeholder="Search..." className="flex-grow" />
  )
}

export default GenericSearch
