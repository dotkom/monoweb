"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { useState, useRef } from "react"
import { Text } from "../../atoms/Typography/Text"
import { Icon } from "../../atoms/Icon/Icon"

export interface MultiSelectOption {
  name: string
}

export interface MultiSelectProps {
  elements: MultiSelectOption[]
  placeholder?: string
}

export const MultiSelect = ({ elements, placeholder }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredItems = elements.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    if (!open) {
      setOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && searchValue === '' && selectedItems.length > 0) {
      setSelectedItems(prev => prev.slice(0, -1))
    } else if (e.key === 'Enter' && searchValue !== '' && filteredItems.length > 0) {
      e.preventDefault()
      handleItemSelect(filteredItems[0].name)
      setSearchValue('')
    }
  }

  const handleItemSelect = (itemName: string) => {
    setSelectedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
    setSearchValue('')
    inputRef.current?.focus()
  }

  const handleInputMouseDown = (e: React.MouseEvent) => {
    if (document.activeElement === inputRef.current) {
      // Input is already focused, do nothing
      e.preventDefault()
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverPrimitive.Anchor asChild>
          <div className="flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-gray-200 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 focus-within:ring-2 focus-within:outline-hidden">
            {selectedItems.map((itemName) => (
              <Text
                key={itemName}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-stone-600 text-blue-800 dark:text-stone-100"
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
            <div className="relative flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onMouseDown={handleInputMouseDown}
                onFocus={() => !open && setOpen(true)}
                autoComplete="off"
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-stone-100"
                aria-expanded={open}
                aria-haspopup="listbox"
                role="combobox"
              />
              {!searchValue && (
                <Text className="absolute left-0 top-0 px-0.5 py-0.5 text-sm text-gray-500 dark:text-stone-400 pointer-events-none">
                  {placeholder}
                </Text>
              )}
              <Icon
                icon="tabler:chevron-down"
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 transition-transform duration-200 ${
                  open ? "transform rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </PopoverPrimitive.Anchor>
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[var(--radix-popover-trigger-width)] max-h-60 overflow-auto bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-600 rounded-md shadow-lg z-50 p-0"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
          onInteractOutside={(e) => {
            // Prevent closing when clicking inside the trigger (input area)
            const target = e.target as Element
            if (inputRef.current?.contains(target)) {
              e.preventDefault()
            }
          }}
        >
          {filteredItems.length > 0 && filteredItems.map((item) => {
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
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent input from losing focus
                }}
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
