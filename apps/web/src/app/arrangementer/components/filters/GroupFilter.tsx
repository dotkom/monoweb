"use client"

import type { Group, GroupId } from "@dotkomonline/types"
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Label,
  Text,
  TextInput,
  cn,
} from "@dotkomonline/ui"
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
      .toSorted((a, b) => a.abbreviation.localeCompare(b.abbreviation, "nb-NO"))
  }, [search, groups, value])

  return (
    <Collapsible className="w-full flex flex-col gap-2" defaultOpen={true}>
      <CollapsibleTrigger
        className={cn(
          "cursor-pointer w-full flex items-center justify-between gap-2 font-medium text-gray-500",
          "[&[data-state=open]>svg]:rotate-180",
          "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-2 h-5.5">
          <Label className="cursor-pointer text-foreground">Arrangør</Label>
          {value.length > 0 && (
            <Text
              element="span"
              className="size-5.5 flex items-center justify-center text-xs bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 rounded-full"
            >
              {value.length}
            </Text>
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
        <div className="relative flex flex-col border border-field-border rounded-xl">
          <div className="relative m-px">
            <IconSearch className="w-7 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground" />
            <TextInput
              className="pl-10 text-base md:text-sm border-none rounded-b-none dark:bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk etter arrangør…"
            />
          </div>

          <div className="flex flex-col gap-1 md:max-h-60 overflow-y-auto p-2 border-t border-field-border">
            {filtered.map((group) => {
              const isSelected = value.includes(group.slug)
              return (
                <Button
                  variant="ghost"
                  key={group.slug}
                  onClick={() => handleToggle(group.slug)}
                  className={cn(
                    "justify-between font-normal text-muted-foreground",
                    isSelected &&
                      "bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 hover:bg-blue-200 dark:hover:bg-sky-800"
                  )}
                >
                  <Text element="span">{group.abbreviation}</Text>
                  {isSelected && <IconCheck className="size-4" />}
                </Button>
              )
            })}
            {filtered.length === 0 && (
              <Text element="span" className="text-sm text-muted-foreground px-3 py-2">
                Ingen arrangører funnet
              </Text>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
