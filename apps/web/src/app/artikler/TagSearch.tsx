"use client"

import { useState, useRef, useEffect } from "react"
import { Text, Button, Icon } from "@dotkomonline/ui"

interface Tag {
  name: string
}

interface TagSearchProps {
  tags: Tag[]
}

export const TagSearch = ({ tags }: TagSearchProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleInputClick = () => {
    setIsDropdownOpen(true)
  }

  const handleInputChange = (e: any) => {
    setSearchValue(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && searchValue === '' && selectedTags.length > 0) {
      setSelectedTags(prev => prev.slice(0, -1))
    } else if (e.key === 'Enter' && searchValue !== '' && filteredTags.length > 0) {
      // Select the first filtered result
      e.preventDefault()
      handleTagSelect(filteredTags[0].name)
      setSearchValue('')
    } else if (e.key === 'Escape') {
      // Close dropdown and unfocus input
      e.preventDefault()
      setIsDropdownOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    )
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
    <div className="border-gray-200 dark:border-stone-700 h-fit xl:w-72 rounded-lg border shadow-b-sm dark:bg-stone-800 flex flex-col p-4 gap-4">
      <p className="font-semibold">Søk</p>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-gray-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          {selectedTags.map((tagName) => (
            <span
              key={tagName}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-stone-600 text-blue-800 dark:text-stone-100"
            >
              {tagName}
              <button
                onClick={() => handleTagSelect(tagName)}
                className="ml-1 text-blue-600 dark:text-stone-300 hover:text-blue-800 dark:hover:text-stone-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            placeholder="Søk etter tags..."
            value={searchValue}
            onClick={handleInputClick}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            autoComplete="off"
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-stone-100"
          />
          <Icon
            icon="tabler:chevron-down"
            className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
              isDropdownOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>

        {isDropdownOpen && filteredTags.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-600 rounded-md shadow-lg"
          >
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name)
              return (
                <div
                  key={tag.name}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors select-none ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-stone-600 hover:bg-blue-50 dark:hover:bg-stone-600 text-blue-800 dark:text-stone-100'
                      : 'text-gray-900 dark:text-stone-100 hover:bg-gray-100 dark:hover:bg-stone-700'
                  }`}
                  onClick={() => {
                    handleTagSelect(tag.name)
                  }}
                >
                  <div className="w-4 flex justify-center">
                    {isSelected && (
                      <Icon icon="tabler:check" width={16} className="text-blue-800 dark:text-stone-100" />
                    )}
                  </div>
                  <span>{tag.name}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}