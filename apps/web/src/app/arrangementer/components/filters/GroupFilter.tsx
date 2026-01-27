"use client"

import type { Group, GroupId } from "@dotkomonline/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Label, TextInput, cn } from "@dotkomonline/ui"
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

interface GroupFilterProps {
  value: GroupId[]
  onChange: (groups: GroupId[]) => void
  groups: Group[]
}

export const GroupFilter = ({ value, onChange, groups }: GroupFilterProps) => {
  const [search, setSearch] = useState("")

  const handleToggle = (slug: GroupId) => {
    const newGroups = value.includes(slug) ? value.filter((g) => g !== slug) : [...value, slug]
    onChange(newGroups)
  }

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return groups
      .filter((group) => value.includes(group.slug) || group.abbreviation.toLowerCase().includes(searchValue))
      .toSorted((a, b) => a.abbreviation.localeCompare(b.abbreviation))
  }, [search, groups, value])

  return (
    <div className="flex flex-col gap-1">
      <Collapsible className="w-full flex flex-col gap-2" defaultOpen={true}>
        <CollapsibleTrigger
          className={cn(
            "cursor-pointer w-full flex items-center justify-between gap-2 font-medium text-gray-500",
            "[&[data-state=open]>svg]:rotate-180",
            "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          )}
        >
          <div className="flex items-center gap-2 h-5.5">
            <Label className="cursor-pointer">Arrangør</Label>
            {value.length > 0 && (
              <span className="size-5.5 flex items-center justify-center text-xs bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 rounded-full">
                {value.length}
              </span>
            )}
          </div>
          <IconChevronDown className="size-[1.25em] transition-transform" />
        </CollapsibleTrigger>

        <CollapsibleContent
          className={cn(
            "overflow-hidden",
            "data-[state=open]:animate-collapsible-down",
            "data-[state=closed]:animate-collapsible-up"
          )}
        >
          <div className="relative flex flex-col border border-gray-200 dark:border-stone-700 rounded-xl">
            <div className="relative m-0.5">
              <IconSearch className="w-7 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3" />
              <TextInput
                className="pl-10 text-base md:text-sm border-none dark:bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter arrangør…"
              />
            </div>

            <div className="flex flex-col gap-1 md:max-h-60 overflow-y-auto p-2 border-t border-gray-200 dark:border-stone-700">
              {filtered.map((group) => {
                const isSelected = value.includes(group.slug)
                return (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => handleToggle(group.slug)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      isSelected
                        ? "bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100"
                        : "hover:bg-gray-100 dark:hover:bg-stone-800"
                    )}
                  >
                    <span>{group.abbreviation}</span>
                    {isSelected && <IconCheck className="size-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
