"use client"

import { Button, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, Text, Title } from "@dotkomonline/ui"

import { IconFilter2 } from "@tabler/icons-react"
import { useState } from "react"
import { SearchInput } from "src/components/molecules/ListFilters/SearchInput"
import { ArticleList } from "./components/ArticleList"
import { ArticleListFilterChips } from "./components/ArticleListFilterChips"
import { ArticleTagFilter } from "./components/ArticleTagFilter"
import { useArticleFilters } from "./hooks/useArticleFilters"

interface ArticleListPageProps {
  availableTags: string[]
}

export const ArticleListPage = ({ availableTags }: ArticleListPageProps) => {
  const { filters, updateFilters, resetFilters } = useArticleFilters()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const activeTagCount = filters.byTags?.length ?? 0

  const hasActiveFilters = filters.bySearchTerm?.trim() !== "" || activeTagCount > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Title element="h1" size="xl">
            Artikler
          </Title>
          <Text className="text-gray-600 dark:text-stone-400">Les artikler skrevet av medlemmer i Online.</Text>
        </div>

        <div className="flex items-center justify-between gap-4 max-sm:mx-3">
          <SearchInput
            initialValue={filters.bySearchTerm ?? ""}
            placeholder="Søk etter artikler..."
            onDebouncedChange={(value) => updateFilters({ bySearchTerm: value })}
            className="min-w-0 flex-1 md:max-w-lg"
            containerClassName="sm:h-12 md:h-full"
          />

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger
              className="md:hidden"
              render={<Button variant="outline" className="relative rounded-lg size-12" />}
            >
              <IconFilter2 className="size-5" />
              {activeTagCount > 0 && (
                <div className="absolute -right-2 -top-2 w-5 h-5 text-xs rounded-full flex items-center justify-center bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100">
                  {activeTagCount}
                </div>
              )}
            </DrawerTrigger>
            <DrawerContent className="px-4 overflow-y-auto max-h-[80dvh]">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  <IconFilter2 className="size-[1.25em]" />
                  Filtrer artikler
                </DrawerTitle>
              </DrawerHeader>

              <div className="px-4 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
                <ArticleTagFilter
                  availableTags={availableTags}
                  selectedTags={filters.byTags ?? []}
                  onChange={(byTags) => updateFilters({ byTags })}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-8 lg:gap-12 min-w-0">
        <aside className="max-md:hidden">
          <ArticleTagFilter
            availableTags={availableTags}
            selectedTags={filters.byTags ?? []}
            onChange={(byTags) => updateFilters({ byTags })}
          />
        </aside>

        <div className="min-w-0 flex flex-col gap-2">
          <div className="grid grid-cols-[auto_1fr] min-w-0 md:min-h-8 items-center max-sm:mx-3">
            {hasActiveFilters && (
              <ArticleListFilterChips
                searchTerm={filters.bySearchTerm ?? ""}
                tagFilter={filters.byTags ?? []}
                onRemoveFilter={(type, value) => {
                  if (type === "search") {
                    updateFilters({ bySearchTerm: "" })
                  }

                  if (type === "tag") {
                    updateFilters({
                      byTags: (filters.byTags ?? []).filter((filterType) => filterType !== value),
                    })
                  }
                }}
                onResetAll={resetFilters}
              />
            )}
          </div>

          <ArticleList query={filters} />
        </div>
      </div>
    </div>
  )
}
