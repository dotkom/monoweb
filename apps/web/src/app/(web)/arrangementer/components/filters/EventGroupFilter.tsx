"use client"

import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import { FilterSection } from "@/components/molecules/ListFilters/FilterSection"
import { getGroupDisplayName, type Group, type GroupId } from "@dotkomonline/rpc/group"
import { AvatarFallback, Button, Text, TextInput, cn } from "@dotkomonline/ui"
import { IconCheck, IconQuestionMark, IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

interface EventGroupFilterProps {
  value: GroupId[]
  onChange: (groups: GroupId[]) => void
  groups: Group[]
  fillHeight?: boolean
  className?: string
}

export const EventGroupFilter = ({ value, onChange, groups, fillHeight = false, className }: EventGroupFilterProps) => {
  const [search, setSearch] = useState("")

  const handleToggle = (slug: GroupId) => {
    const newGroups = value.includes(slug) ? value.filter((groupSlug) => groupSlug !== slug) : [...value, slug]
    onChange(newGroups)
  }

  const filteredGroups = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return groups
      .filter((group) => {
        if (value.includes(group.slug)) {
          return true
        }

        const displayName = getGroupDisplayName(group).toLowerCase()
        const officialName = group.name?.toLowerCase() ?? ""
        const shortName = group.abbreviation.toLowerCase()

        return (
          displayName.includes(searchValue) ||
          officialName.includes(searchValue) ||
          shortName.includes(searchValue) ||
          group.slug.toLowerCase().includes(searchValue)
        )
      })
      .toSorted((firstGroup, secondGroup) =>
        getGroupDisplayName(firstGroup).localeCompare(getGroupDisplayName(secondGroup), "nb-NO")
      )
  }, [search, groups, value])

  return (
    <FilterSection title="Arrangør" count={value.length} className={cn("max-w-md", fillHeight && "h-full", className)}>
      <div
        className={cn(
          "relative flex flex-col border border-field-border rounded-xl bg-background",
          fillHeight && "flex-1 min-h-0"
        )}
      >
        <div className="relative m-px">
          <IconSearch className="w-8 md:w-7 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground" />
          <TextInput
            className="pl-10 max-md:h-12 max-md:text-base border-none rounded-b-none dark:bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk etter arrangør…"
          />
        </div>

        {/* Absolute so the list doesn't grow the parent */}
        <div className={cn("border-t border-field-border", fillHeight && "relative flex-1 min-h-40")}>
          <div
            className={cn(
              "flex flex-col gap-2 md:gap-1 overflow-y-auto p-2",
              fillHeight ? "absolute inset-0 rounded-b-xl" : "md:max-h-60"
            )}
          >
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const isSelected = value.includes(group.slug)
                const displayName = getGroupDisplayName(group)

                return (
                  <Button
                    variant="ghost"
                    key={group.slug}
                    title={displayName}
                    onClick={() => handleToggle(group.slug)}
                    className={cn(
                      "group/group-item max-md:h-11 md:px-1.5 justify-between font-normal text-muted-foreground",
                      isSelected &&
                        "bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100 hover:bg-blue-200 dark:hover:bg-sky-800"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GroupLogoAvatar
                        size="sm"
                        src={group.imageUrl}
                        alt={displayName}
                        className="p-0.5 -m-0.5"
                        imageClassName="saturate-50 opacity-75 group-hover/group-item:saturate-100 group-hover/group-item:opacity-100 transition-all"
                        fallback={
                          <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
                            <IconQuestionMark className="size-4 text-muted-foreground" />
                          </AvatarFallback>
                        }
                      />
                      <Text element="span" className="truncate max-md:text-base">
                        {displayName}
                      </Text>
                    </div>
                    {isSelected && <IconCheck className="size-4" />}
                  </Button>
                )
              })
            ) : (
              <Text element="span" className="text-sm text-muted-foreground px-3 py-2">
                Ingen arrangører funnet
              </Text>
            )}
          </div>
        </div>
      </div>
    </FilterSection>
  )
}
