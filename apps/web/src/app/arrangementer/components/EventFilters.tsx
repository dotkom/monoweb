"use client"

import {
  type EventFilterQuery,
  EventSchema,
  type EventType,
  EventTypeSchema,
  type Group,
  type GroupId,
  GroupSchema,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import {
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
  TextInput,
  cn,
} from "@dotkomonline/ui"
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { type EventListViewMode, EventListViewModeSchema } from "./EventList"

const FormSchema = z.object({
  byType: z.array(EventSchema.shape.type),
  byOrganizingGroup: z.array(GroupSchema.shape.slug),
  viewMode: EventListViewModeSchema,
})

type FormValues = z.infer<typeof FormSchema>

interface Props {
  onChange(filters: EventFilterQuery, viewMode: EventListViewMode): void
  groups: Group[]
  typeFilters: EventType[]
  groupFilters: GroupId[]
  viewMode: EventListViewMode
  isStaff: boolean
}

export const EventFilters = ({ onChange, groups, typeFilters, groupFilters, viewMode, isStaff }: Props) => {
  const form = useForm<FormValues>({
    values: {
      byType: typeFilters,
      byOrganizingGroup: groupFilters,
      viewMode: viewMode,
    },
  })
  const data = useWatch({ control: form.control }) as FormValues
  const handleSubmit = useCallback(
    (values: FormValues) => {
      onChange(
        {
          byType: values.byType.length > 0 ? values.byType : undefined,
          byOrganizingGroup: values.byOrganizingGroup.length > 0 ? values.byOrganizingGroup : undefined,
        },
        values.viewMode
      )
    },
    [onChange]
  )

  useEffect(() => {
    handleSubmit(data)
  }, [data, handleSubmit])

  const EVENT_TYPE_OPTIONS = Object.values(EventTypeSchema.Values)
    .filter((type) => isStaff || type !== "INTERNAL")
    .map((type) => ({
      value: type,
      label: mapEventTypeToLabel(type),
    }))

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6 max-w-sm mx-auto">
      <Controller
        control={form.control}
        name="viewMode"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Label htmlFor="viewMode" className="text-gray-500 font-medium dark:text-stone-400 pointer-events-none">
              Sorter
            </Label>
            <RadioGroup className="pt-2 pl-1 flex md:flex-col gap-6 md:gap-2" value={value} onValueChange={onChange}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="ATTENDANCE" id="r1" />
                <Label htmlFor="r1">Påmelding</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="CHRONOLOGICAL" id="r2" />
                <Label htmlFor="r2">Kronologisk</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="byType"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger
                className={cn(
                  "cursor-pointer w-full flex items-center justify-between gap-2 py-1 font-medium text-gray-500",
                  "[&[data-state=open]>svg]:rotate-180",
                  "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                )}
              >
                <div className="flex items-center gap-2">
                  <Label>Kategori</Label>
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
                <div className="flex flex-col gap-2 pt-2">
                  {EVENT_TYPE_OPTIONS.map((type) => (
                    <div key={type.value} className="flex items-center gap-3">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={value.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange([...value, type.value])
                          } else {
                            onChange(value.filter((v) => v !== type.value))
                          }
                        }}
                      />
                      <Label htmlFor={`type-${type.value}`} className="cursor-pointer font-normal">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="byOrganizingGroup"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <CollapsibleGroupSelect onChange={onChange} groups={groups} value={value} />
          </div>
        )}
      />
    </form>
  )
}

const CollapsibleGroupSelect = ({
  value,
  onChange,
  groups,
}: {
  value: string[]
  onChange: (value: string[]) => void
  groups: Group[]
}) => {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return groups.filter(
      (group) => value.includes(group.slug) || group.abbreviation.toLowerCase().includes(searchValue)
    )
  }, [search, groups, value])

  const handleToggle = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter((v) => v !== slug))
    } else {
      onChange([...value, slug])
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Collapsible className="w-full flex flex-col gap-2">
        <CollapsibleTrigger
          className={cn(
            "cursor-pointer w-full flex items-center justify-between gap-2 py-1 font-medium text-gray-500",
            "[&[data-state=open]>svg]:rotate-180",
            "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          )}
        >
          <div className="flex items-center gap-2">
            <Label>Arrangør</Label>
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
