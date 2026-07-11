import { ErrorMessage } from "@hookform/error-message"
import { Loader, MultiSelect, type MultiSelectProps, Select, type SelectProps } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useRef, useState } from "react"
import { Controller, type FieldValues, useController } from "react-hook-form"
import type { InputProducerResult } from "./types"

export interface SelectOption {
  value: string
  label: string
}

interface UseSearchHookResult<T> {
  data: T[]
  isLoading: boolean
}

type UseSearchHook<T> = (searchQuery: string) => UseSearchHookResult<T>
type DataMapper<T> = (item: T) => SelectOption
type GetSelectedItem<T> = (id: string) => T | undefined

interface BaseProps<T> {
  /** Hook that performs the search query. Receives the debounced search string. */
  useSearchHook: UseSearchHook<T>
  /** Maps an item from the search results to a select option */
  dataMapper: DataMapper<T>
  /** Optional function to get a selected item by ID (for displaying selected items not in search results) */
  getSelectedItem?: GetSelectedItem<T>
  /** Debounce delay in milliseconds. Defaults to 300. */
  debounceMs?: number
}

interface SingleSelectProps<T> extends BaseProps<T> {
  multiSelect?: false
  selectProps?: Omit<
    SelectProps,
    "data" | "value" | "onChange" | "error" | "searchable" | "searchValue" | "onSearchChange"
  >
}

interface MultiSelectInputProps<T> extends BaseProps<T> {
  multiSelect: true
  selectProps?: Omit<
    MultiSelectProps,
    "data" | "value" | "onChange" | "error" | "searchable" | "searchValue" | "onSearchChange"
  >
}

type Props<T> = SingleSelectProps<T> | MultiSelectInputProps<T>

export function createSearchableSelectInput<F extends FieldValues, T>({
  useSearchHook,
  dataMapper,
  getSelectedItem,
  debounceMs = 300,
  ...rest
}: Props<T>): InputProducerResult<F> {
  const isMultiSelect = "multiSelect" in rest && rest.multiSelect === true

  return function FormSearchableSelectInput({ name, state, control }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, debounceMs)

    // Cache to store selected items for display when they're not in search results
    const selectedItemsCache = useRef<Map<string, T>>(new Map())

    const { data, isLoading } = useSearchHook(debouncedSearchQuery)
    const { field } = useController({ name, control })

    const options = data.map(dataMapper)

    // Cache items from current search results that match selected values
    const selectedValues = isMultiSelect ? ((field.value as string[]) ?? []) : field.value ? [field.value] : []
    for (const item of data) {
      const mapped = dataMapper(item)
      if (selectedValues.includes(mapped.value)) {
        selectedItemsCache.current.set(mapped.value, item)
      }
    }

    // Helper to find an item for a selected value
    const findSelectedItem = (id: string): T | undefined => {
      // Check cache first
      const cachedItem = selectedItemsCache.current.get(id)
      if (cachedItem) {
        return cachedItem
      }

      // Try getSelectedItem if provided
      if (getSelectedItem) {
        const item = getSelectedItem(id)
        if (item) {
          selectedItemsCache.current.set(id, item)
          return item
        }
      }

      return undefined
    }

    // For single select: ensure selected value is in options
    if (!isMultiSelect && field.value) {
      if (!options.some((o) => o.value === field.value)) {
        const selectedItem = findSelectedItem(field.value)
        if (selectedItem) {
          options.push(dataMapper(selectedItem))
        }
      }
    }

    // For multi select: ensure all selected values are in options
    if (isMultiSelect && Array.isArray(field.value)) {
      const selectedIds = field.value as string[]
      for (const selectedId of selectedIds) {
        if (!options.some((o) => o.value === selectedId)) {
          const selectedItem = findSelectedItem(selectedId)
          if (selectedItem) {
            options.push(dataMapper(selectedItem))
          }
        }
      }
    }

    const handleSearch = (query: string) => {
      setSearchQuery(query)
    }

    if (isMultiSelect) {
      const multiProps = (rest as MultiSelectInputProps<T>).selectProps
      return (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <MultiSelect
              {...multiProps}
              data={options}
              value={field.value ?? []}
              onChange={field.onChange}
              searchValue={searchQuery}
              onSearchChange={handleSearch}
              searchable={true}
              rightSection={isLoading ? <Loader size="xs" /> : undefined}
              error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            />
          )}
        />
      )
    }

    const singleProps = (rest as SingleSelectProps<T>).selectProps
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...singleProps}
            data={options}
            value={field.value}
            onChange={field.onChange}
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            searchable={true}
            rightSection={isLoading ? <Loader size="xs" /> : undefined}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}
