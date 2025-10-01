"use client"

import { Text, TextInput, MultiSelect } from "@dotkomonline/ui"
import type { ArticleFilterQuery } from "@dotkomonline/types"
import { useEffect } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Tag {
  name: string
}

interface ArticleSearchSectionProps {
  tags: Tag[]
  onChange: (filters: ArticleFilterQuery) => void
  defaultValues?: ArticleFilterQuery
}

export const ArticleSearchSection = ({ tags, onChange, defaultValues }: ArticleSearchSectionProps) => {
  const form = useForm<ArticleFilterQuery>({
    defaultValues: defaultValues ?? { byTags: [], bySearchTerm: "" },
  })

  const data = useWatch({ control: form.control })
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData as ArticleFilterQuery)
  }, [onChange, debouncedData])

  return (
    <div className="border-gray-200 dark:border-stone-700 h-fit w-full xl:w-72 rounded-lg border shadow-b-sm bg-white dark:bg-stone-800 flex flex-col p-4 gap-4">
      <p className="font-semibold">Søk</p>

      <div>
        <Text className="text-sm font-medium mb-2">Søk etter artikler</Text>
        <TextInput
          placeholder="Søk etter artikler..."
          {...form.register("bySearchTerm")}
        />
      </div>
      <div>
        <Text className="text-sm font-medium mb-2">Søk etter tags</Text>
        <Controller
          name="byTags"
          control={form.control}
          render={({ field: { onChange: onTagChange, value = [] } }) => (
            <MultiSelect
              elements={tags}
              placeholder="Søk etter tags..."
              selectedItems={value}
              onSelectionChange={onTagChange}
            />
          )}
        />
      </div>

    </div>
  )
}