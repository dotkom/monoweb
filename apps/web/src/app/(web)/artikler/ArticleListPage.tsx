"use client"

import { Title, ToggleGroup, ToggleGroupItem, Text } from "@dotkomonline/ui"
import type { ArticleListViewMode } from "./hooks/articleViewCookie"
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react"
import { useArticlesView } from "./hooks/useArticlesView"
import { useArticlesViewNavigation } from "./hooks/useArticlesViewNavigation"
import { SearchInput } from "src/components/molecules/ListFilters/SearchInput"
import { useArticleFilters } from "./hooks/useArticleFilters"
import { ArticleList } from "./components/ArticleList"
import { ArticleListFilterChips } from "./components/ArticleListFilterChips"

interface ArticleListPageProps {
  initialListViewMode: ArticleListViewMode
}

export const ArticleListPage = ({ initialListViewMode }: ArticleListPageProps) => {
  const { view, isCards, setListViewMode } = useArticlesView(initialListViewMode)
  const { navigateToView } = useArticlesViewNavigation(setListViewMode)
  const { filters, updateFilters, resetFilters } = useArticleFilters()

  const hasActiveFilters = filters.search || filters.tags.length > 0

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Artikler
      </Title>
      <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>

      <div className="flex min-w-0 justify-between gap-x-2 gap-y-3 sticky top-[calc(var(--navbar-height)+(--spacing(6)))] z-30 -m-2 bg-background p-2 rounded-2xl transition-shadow">
        <div className="w-full sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(max-content,1fr)_minmax(0,22.5rem)_minmax(max-content,1fr)]">
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

          <SearchInput
            initialValue={filters.search}
            placeholder="Søk etter artikler..."
            onDebouncedChange={(value) => updateFilters({ search: value })}
            className="w-full min-w-0 max-w-90"
          />
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
