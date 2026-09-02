"use client"

import { CollapsibleFilterSection } from "@/components/molecules/ListFilters/CollapsibleFilterSection"
import { Checkbox, Label, cn } from "@dotkomonline/ui"
import { useMemo } from "react"

interface JobLocationFilterProps {
  value: string[]
  onChange: (locations: string[]) => void
  locations: string[]
}

export const JobLocationFilter = ({ value, onChange, locations }: JobLocationFilterProps) => {
  const handleToggle = (location: string) => {
    const newLocations = value.includes(location) ? value.filter((l) => l !== location) : [...value, location]
    onChange(newLocations)
  }

  const sortedLocations = useMemo(() => locations.toSorted((a, b) => a.localeCompare(b, "nb-NO")), [locations])

  return (
    <CollapsibleFilterSection title="Sted" count={value.length}>
      <div className="flex flex-col pt-2">
        {sortedLocations.map((location) => {
          const isSelected = value.includes(location)

          return (
            <div key={location} className="flex items-center gap-3">
              <Checkbox
                id={`location-${location}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(location)}
                className="size-5"
              />
              <Label
                htmlFor={`location-${location}`}
                className={cn(
                  "cursor-pointer font-normal text-base md:text-sm text-muted-foreground hover:text-foreground w-full py-1",
                  isSelected && "text-foreground"
                )}
              >
                {location}
              </Label>
            </div>
          )
        })}
      </div>
    </CollapsibleFilterSection>
  )
}
