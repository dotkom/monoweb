"use client"

import { CollapsibleFilterSection } from "@/components/molecules/ListFilters/CollapsibleFilterSection"
import { JOB_LISTING_EMPLOYMENT_CONFIG } from "@/components/molecules/JobListingItem/jobListingTypeConfig"
import { EmploymentTypeSchema, type JobListingEmployment } from "@dotkomonline/rpc/job-listing"
import { Checkbox, Label, cn } from "@dotkomonline/ui"

interface JobEmploymentFilterProps {
  value: JobListingEmployment[]
  onChange: (employments: JobListingEmployment[]) => void
}

export const JobEmploymentFilter = ({ value, onChange }: JobEmploymentFilterProps) => {
  const options = EmploymentTypeSchema.options.map((employment) => ({
    value: employment,
    label: JOB_LISTING_EMPLOYMENT_CONFIG[employment].label,
  }))

  const handleToggle = (employment: JobListingEmployment) => {
    const newEmployments = value.includes(employment) ? value.filter((e) => e !== employment) : [...value, employment]
    onChange(newEmployments)
  }

  return (
    <CollapsibleFilterSection title="Stillingstype" count={value.length}>
      <div className="flex flex-col pt-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value)

          return (
            <div key={option.value} className="flex items-center gap-3">
              <Checkbox
                id={`employment-${option.value}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(option.value)}
                className="size-5"
              />
              <Label
                htmlFor={`employment-${option.value}`}
                className={cn(
                  "cursor-pointer font-normal text-base md:text-sm text-muted-foreground hover:text-foreground w-full py-1",
                  isSelected && "text-foreground"
                )}
              >
                {option.label}
              </Label>
            </div>
          )
        })}
      </div>
    </CollapsibleFilterSection>
  )
}
