"use client"

import {
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Text,
  cn,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerTrigger,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@dotkomonline/ui"
import type { ArticleListViewMode } from "./hooks/articleViewCookie"
import { IconFilter2, IconLayoutGrid, IconLayoutList, IconSearch, IconX } from "@tabler/icons-react"
import { useArticlesView } from "./hooks/useArticlesView"
import { useArticlesViewNavigation } from "./hooks/useArticlesViewNavigation"
import { SearchInput } from "src/components/molecules/ListFilters/SearchInput"
import { useArticleFilters } from "./hooks/useArticleFilters"
import { ArticleList } from "./components/ArticleList"
import { ArticleListFilterChips } from "./components/ArticleListFilterChips"
import { useState } from "react"
import { ArticleTagFilter } from "./components/ArticleTagFilter"

interface ArticleListPageProps {
  initialListViewMode: ArticleListViewMode
  availableTags: string[]
}

export const ArticleListPage = ({ initialListViewMode, availableTags }: ArticleListPageProps) => {
  const { view, isCards, setListViewMode } = useArticlesView(initialListViewMode)
  const { navigateToView } = useArticlesViewNavigation(setListViewMode)
  const { filters, updateFilters, resetFilters } = useArticleFilters()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchBarOpen, setSearchBarOpen] = useState(filters.search.length > 0)
  const activeTagCount = filters.tags.length

  const hasActiveFilters = filters.search || filters.tags.length > 0

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
        <div
          className={cn(
            "flex min-w-0 gap-4",
            "w-full flex-wrap sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(max-content,1fr)_minmax(0,22.5rem)_minmax(max-content,1fr)]"
          )}
        >
          <ToggleGroup
            className="shrink-0 h-10 bg-background"
            multiple={false}
            spacing={0}
            value={[view]}
            onValueChange={(value) => {
              const nextView = value.at(0)

              if (nextView === "list") {
                navigateToView("list")
              }

              if (nextView === "cards") {
                navigateToView("cards")
              }
            }}
          >
            <ToggleGroupItem
              value="cards"
              className="flex flex-row items-center gap-2 h-full border-field-border max-[390px]:justify-center max-[390px]:w-12"
            >
              <IconLayoutGrid className="size-4.5" />
              <Text element="span" className="max-[390px]:hidden">
                Kort
              </Text>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              className="flex flex-row items-center gap-2 h-full border-field-border max-[390px]:justify-center max-[390px]:w-12"
            >
              <IconLayoutList className="size-4.5" />
              <Text element="span" className="max-[390px]:hidden">
                Liste
              </Text>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="max-sm:hidden flex min-w-0 justify-center">
            <SearchInput
              initialValue={filters.search}
              placeholder="Søk etter artikler..."
              onDebouncedChange={(value) => updateFilters({ search: value })}
              className="w-full min-w-0 max-w-90"
            />
          </div>

          <div className="ml-auto flex shrink-0 justify-self-end justify-end items-stretch gap-2">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger
                className="md:hidden"
                render={<Button variant="outline" className="relative rounded-lg size-10 sm:w-fit sm:h-full" />}
              >
                <IconFilter2 className="size-5" />
                <span className="hidden sm:block text-sm pl-1">Filter</span>
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
                          selectedTags={filters.tags}
                          onChange={(tags) => updateFilters({ tags })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="max-md:hidden shrink-0 rounded-lg h-10 gap-2">
                  <IconFilter2 className="size-5" />
                  Filter
                  {activeTagCount > 0 && (
                    <span className="size-5 flex items-center justify-center text-xs rounded-full bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100">
                      {activeTagCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={12}
                positionMethod="fixed"
                align="end"
                className="max-md:hidden max-w-[calc(100vw-2rem)] max-h-[min(80dvh,var(--available-height))] overflow-y-auto p-5"
              >
                <div className="flex flex-col gap-6">
                  <ArticleTagFilter availableTags={availableTags} selectedTags={filters.tags} onChange={(tags) => updateFilters({ tags })} />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon-xl"
              onClick={() => setSearchBarOpen((v) => !v)}
              className="sm:hidden"
            >
              {searchBarOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
            </Button>
          </div>
          {searchBarOpen && (
            <div className="sm:hidden w-full">
              <SearchInput initialValue={filters.search} placeholder="Søk etter artikler..." onDebouncedChange={(value) => updateFilters({ search: value })} />
            </div>
          )}
        </div>
      </div>
        
      {hasActiveFilters && (
        <div className="min-w-0 md:grid md:grid-cols-[minmax(0,1fr)_18rem] md:gap-6 lg:gap-8">
          <div className="mt-2 min-w-0 flex flex-col gap-2">
            <ArticleListFilterChips
              searchTerm={filters.search}
              tagFilter={filters.tags}
              onRemoveFilter={(type, value) => {
                if (type === "search") {
                  updateFilters({ search: "" })
                }

                if (type === "tag") {
                  updateFilters({
                    tags: filters.tags.filter((filterType) => filterType !== value),
                  })
                }
              }}
              onResetAll={resetFilters}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 md:grid md:grid-cols-[minmax(0,1fr,1fr)_18rem] md:gap-6 lg:gap-8">
        <div className="mt-2 min-w-0 flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <ArticleList filters={filters} viewMode={isCards ? "cards" : "list"} />
          </div>
        </div>
      </div>
    </div>
  )
}
