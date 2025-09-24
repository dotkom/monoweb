"use client"

import {
  type EventFilterQuery,
  EventFilterQuerySchema,
  EventSchema,
  EventTypeSchema,
  type Group,
  GroupSchema,
  mapEventTypeToLabel,
} from "@dotkomonline/types"
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextInput,
} from "@dotkomonline/ui"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { z } from "zod"
import { type EventListViewMode, EventListViewModeSchema } from "./EventList"

const EVENT_TYPE_OPTIONS = Object.values(EventTypeSchema.Values).map((type) => ({
  value: type,
  label: mapEventTypeToLabel(type),
}))

const FormSchema = EventFilterQuerySchema.pick({
  bySearchTerm: true,
}).extend({
  byType: EventSchema.shape.type.or(z.literal("ALL")),
  byOrganizingGroup: GroupSchema.shape.slug,
  viewMode: EventListViewModeSchema,
})

type FormValues = z.infer<typeof FormSchema>

interface Props {
  onChange(filters: EventFilterQuery, viewMode: EventListViewMode): void
  groups: Group[]
}

export const EventFilters = ({ onChange, groups }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      bySearchTerm: "",
      byType: "ALL",
      byOrganizingGroup: "ALL",
      viewMode: "ATTENDANCE",
    },
  })
  const data = useWatch({ control: form.control }) as FormValues
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    handleSubmit(debouncedData)
  }, [debouncedData])

  const handleSubmit = (values: FormValues) => {
    onChange(
      {
        bySearchTerm: values.bySearchTerm,
        byType: values.byType !== "ALL" ? [values.byType] : [],
        byOrganizingGroup: values.byOrganizingGroup !== "ALL" ? [values.byOrganizingGroup] : [],
      },
      values.viewMode
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 md:gap-1.5">
        <Label htmlFor="bySearchTerm" className="text-gray-500 dark:text-stone-500">
          Søk
        </Label>
        <TextInput placeholder="Søk etter arrangementer..." {...form.register("bySearchTerm")} id="bySearchTerm" />
      </div>

      <Controller
        control={form.control}
        name="byType"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Label htmlFor="byType" className="text-gray-500 dark:text-stone-500">
              Type
            </Label>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger id="byType">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL" key="ALL">
                    Alle
                  </SelectItem>
                  {EVENT_TYPE_OPTIONS.map((type) => (
                    <SelectItem value={type.value} key={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="byOrganizingGroup"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Label htmlFor="byOrganizingGroup" className="text-gray-500 dark:text-stone-500">
              Arrangør
            </Label>
            <GroupSelect onChange={onChange} groups={groups} value={value} />
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="viewMode"
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Label htmlFor="viewMode" className="text-gray-500 dark:text-stone-500">
              Sorter
            </Label>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger id="viewMode">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ATTENDANCE">Påmelding</SelectItem>
                  <SelectItem value="CHRONOLOGICAL">Kronologisk</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </form>
  )
}

const GroupSelect = ({
  value,
  onChange,
  groups,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  groups: Group[]
}) => {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return groups.filter((group) => group.slug === value || group.abbreviation.toLowerCase().includes(searchValue))
  }, [search, groups, value])

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSearch("")
    }
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val)} onOpenChange={handleOpenChange}>
      <SelectTrigger id="byOrganizingGroup">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72" hideScrollUpButton>
        <div
          className="sticky top-0 z-10 -translate-y-1 p-2
               bg-white dark:bg-stone-800
               border-b border-gray-200 dark:border-stone-700"
        >
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Søk…"
          />
        </div>

        <SelectGroup>
          <SelectItem value="ALL">Alle</SelectItem>
          {filtered.map((group) => (
            <SelectItem key={group.slug} value={group.slug}>
              {group.abbreviation}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
