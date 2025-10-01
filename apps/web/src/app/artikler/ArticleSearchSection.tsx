"use client"

import { Text, TextInput, MultiSelect } from "@dotkomonline/ui"

interface Tag {
  name: string
}

interface ArticleSearchSectionProps {
  tags: Tag[]
}

export const ArticleSearchSection = ({ tags }: ArticleSearchSectionProps) => {
  return (
    <div className="border-gray-200 dark:border-stone-700 h-fit xl:w-72 rounded-lg border shadow-b-sm bg-white dark:bg-stone-800 flex flex-col p-4 gap-4">
      <p className="font-semibold">Søk</p>

      <div>
        <Text className="text-sm font-medium mb-2">Søk etter artikler</Text>
        <TextInput
          placeholder="Søk etter artikler..."
        />
      </div>
      <div>
        <Text className="text-sm font-medium mb-2">Søk etter tags</Text>
        <MultiSelect elements={tags} placeholder="Søk etter tags..."/>
      </div>

    </div>
  )
}