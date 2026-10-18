"use client"

import {
  Title,
  Text,
  cn,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerTrigger,
  Button,
} from "@dotkomonline/ui"

import { IconFilter2 } from "@tabler/icons-react"
import { SearchInput } from "src/components/molecules/ListFilters/SearchInput"
import { useArticleFilters } from "./hooks/useArticleFilters"
import { ArticleList } from "./components/ArticleList"
import { ArticleListFilterChips } from "./components/ArticleListFilterChips"
import { useState } from "react"
import { ArticleTagFilter } from "./components/ArticleTagFilter"

interface ArticleListPageProps {
  availableTags: string[]
}

export const ArticleListPage = ({ availableTags }: ArticleListPageProps) => {
  const { filters, updateFilters, resetFilters } = useArticleFilters()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeTagCount = filters.byTags?.length ?? 0

  const hasActiveFilters = !!filters.bySearchTerm || activeTagCount > 0

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Artikler
      </Title>
      <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>

      <div
        className={cn(
          "flex min-w-0 justify-between gap-x-2 gap-y-3",
          "sticky top-[calc(var(--navbar-height)+(--spacing(6)))] z-30 -m-2 bg-background p-2 rounded-2xl transition-shadow"
        )}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <SearchInput
            initialValue={filters.bySearchTerm ?? ""}
            placeholder="Søk etter artikler..."
            onDebouncedChange={(value) => updateFilters({ bySearchTerm: value })}
            className="w-full max-w-[32rem]"
          />

          <div className="ml-auto flex shrink-0 justify-self-end justify-end items-stretch gap-2">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger
                className="sm:hidden"
                render={<Button variant="outline" className="relative rounded-lg size-12" />}
              >
                <IconFilter2 className="size-5" />
                {activeTagCount > 0 && (
                  <div className="absolute -right-2 -top-2 w-5 h-5 text-xs rounded-full flex items-center justify-center bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100">
                    {activeTagCount}
                  </div>
                )}
              </DrawerTrigger>
              <DrawerContent>
                <div className="px-4 overflow-y-auto max-h-[80dvh]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <IconFilter2 className="size-[1.25em]" />
                      Filtrer artikler
                    </DrawerTitle>
                  </DrawerHeader>

                  <div className="px-4 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
                    <div>
                      <div className="mt-6">
                        <ArticleTagFilter
                          availableTags={availableTags}
                          selectedTags={filters.byTags ?? []}
                          onChange={(byTags) => updateFilters({ byTags })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="max-sm:hidden sm:grid sm:grid-cols-[15rem_auto] sm:gap-8 lg:gap-12 min-w-0 max-w-[18rem]">
          <div className="mt-4">
            <ArticleTagFilter
              availableTags={availableTags}
              selectedTags={filters.byTags ?? []}
              onChange={(byTags) => updateFilters({ byTags })}
            />
          </div>
        </div>

        <div className="mt-2 min-w-0 flex flex-col gap-2">
          <div className="grid grid-cols-[auto_1fr] w-full sm:h-8 items-center">
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
          <div className="flex flex-col gap-4">
            <ArticleList query={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}
