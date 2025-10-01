"use client"

import { useState, useRef, useEffect } from "react"
import { Text } from "../../atoms/Typography/Text"
import { Icon } from "../../atoms/Icon/Icon"

export interface MultiSelectOption {
  name: string
}

export interface MultiSelectProps {
  elements: MultiSelectOption[]
  placeholder?: string
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
}

export const MultiSelect = ({ elements, placeholder, selectedItems: controlledSelectedItems, onSelectionChange }: MultiSelectProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [internalSelectedItems, setInternalSelectedItems] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use controlled value if provided, otherwise use internal state
  const selectedItems = controlledSelectedItems !== undefined ? controlledSelectedItems : internalSelectedItems

  const filteredItems = elements.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    setIsDropdownOpen(true)
  }

  const updateSelectedItems = (newItems: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(newItems)
    } else {
      setInternalSelectedItems(newItems)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && searchValue === '' && selectedItems.length > 0) {
      updateSelectedItems(selectedItems.slice(0, -1))
    } else if (e.key === 'Enter' && searchValue !== '' && filteredItems.length > 0) {
      e.preventDefault()
      handleItemSelect(filteredItems[0].name)
      setSearchValue('')
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsDropdownOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleItemSelect = (itemName: string) => {
    const newSelection = selectedItems.includes(itemName)
      ? selectedItems.filter(item => item !== itemName)
      : [...selectedItems, itemName]

    updateSelectedItems(newSelection)
    setSearchValue('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-gray-200 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 focus-within:ring-2 focus-within:outline-hidden">
        {selectedItems.map((itemName) => (
          <Text
            key={itemName}
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-stone-600 text-blue-800 dark:text-stone-100 shrink-0"
          >
            {itemName}
            <button
              onClick={(e) => {
                e.preventDefault()
                handleItemSelect(itemName)
              }}
              className="ml-1 text-blue-600 dark:text-stone-300 hover:text-blue-800 dark:hover:text-stone-100 flex items-center"
            >
              <Icon icon="tabler:x" width={12} />
            </button>
          </Text>
        ))}
        <div className="relative flex-1 basis-full min-w-0">
          <input
            ref={inputRef}
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            autoComplete="off"
            className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-stone-100"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          {!searchValue && (
            <Text className="absolute left-0 top-0 px-0.5 py-0.5 text-sm text-gray-500 dark:text-stone-400 pointer-events-none whitespace-nowrap">
              {placeholder}
            </Text>
          )}
          <Icon
            icon="tabler:chevron-down"
            className={`absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 transition-transform duration-200 ${
              isDropdownOpen ? "transform rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </div>
      {isDropdownOpen && filteredItems.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-600 rounded-md shadow-lg"
        >
          {filteredItems.map((item) => {
            const isSelected = selectedItems.includes(item.name)
            return (
              <div
                key={item.name}
                role="option"
                aria-selected={isSelected}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors select-none border border-transparent ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-stone-600 hover:bg-blue-50 dark:hover:bg-stone-600 text-blue-800 dark:text-stone-100 border-blue-200 dark:border-stone-500'
                    : 'text-gray-900 dark:text-stone-100 hover:bg-gray-100 dark:hover:bg-stone-700 hover:border-gray-200 dark:hover:border-stone-600'
                } -mb-px`}
                onClick={() => {
                  handleItemSelect(item.name)
                }}
              >
                <div className="w-4 flex justify-center">
                  {isSelected && (
                    <Icon icon="tabler:check" width={16} className="text-blue-800 dark:text-stone-100" />
                  )}
                </div>
                <span>{item.name}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
