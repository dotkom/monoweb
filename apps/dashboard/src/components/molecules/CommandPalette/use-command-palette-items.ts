"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { filterNavigationsUserHasAccessTo, navigations } from "@/lib/navigation"
import { useMemo, useRef } from "react"
import { searchItems, toPageAndActionSearchItems, type SearchItem } from "./command-palette-search"
import {
  toArticleSearchItem,
  toCompanySearchItem,
  toContestSearchItem,
  toEventSearchItem,
  toFadderukeSearchItem,
  toGroupSearchItem,
  toJobListingSearchItem,
  toMarkSearchItem,
  toNotificationSearchItem,
  toOfflineSearchItem,
  toUserSearchItem,
} from "./parse-to-search-item"
import { useCommandPaletteCatalogQuery, useCommandPaletteSearchQuery } from "./queries"

export const MIN_SEARCH_LENGTH_FOR_RESOURCES = 1

export function useCommandPaletteItems(searchTerm: string, debouncedSearchTerm: string, isCommandPaletteOpen: boolean) {
  const authorization = useAuthorization()

  const isResourcesQueryEnabled =
    isCommandPaletteOpen && debouncedSearchTerm.trim().length >= MIN_SEARCH_LENGTH_FOR_RESOURCES
  const isInitialDataQueryEnabled = isCommandPaletteOpen

  // These tables are small enough that they can be fetched once when the command palette is opened and client-side filtered
  const { groups, contests, articles, offlines, fadderukene } = useCommandPaletteCatalogQuery({
    disabled: !isInitialDataQueryEnabled,
  })

  const { events, notifications, marks, jobListings, companies, users, isFetching } = useCommandPaletteSearchQuery({
    searchTerm: debouncedSearchTerm,
    disabled: !isResourcesQueryEnabled,
  })

  const localCatalog = useMemo(
    () => [
      ...groups.map(toGroupSearchItem),
      ...contests.map(toContestSearchItem),
      ...articles.map(toArticleSearchItem),
      ...offlines.map(toOfflineSearchItem),
      ...fadderukene.map(toFadderukeSearchItem),
    ],
    [groups, contests, articles, offlines, fadderukene]
  )

  const searchedResources = useMemo(
    () => [
      ...events.map(toEventSearchItem),
      ...notifications.map(toNotificationSearchItem),
      ...marks.map(toMarkSearchItem),
      ...jobListings.map(toJobListingSearchItem),
      ...companies.map(toCompanySearchItem),
      ...users.map(toUserSearchItem),
    ],
    [events, notifications, marks, jobListings, companies, users]
  )

  const settledResourcesRef = useRef<SearchItem[]>([])

  // Treat the local catalog as part of the search results so they
  // don't get updated before the search has finished.
  const isResourceSearchSettled = searchTerm === debouncedSearchTerm && !isFetching

  let resources: SearchItem[]

  if (!isCommandPaletteOpen || searchTerm.trim().length < MIN_SEARCH_LENGTH_FOR_RESOURCES) {
    settledResourcesRef.current = []
    resources = []
  } else if (!isResourceSearchSettled) {
    // Backend filters resources using `includes`, while the command palette only searches on exact matches and `startsWith`.
    // While the backend queries are pending, we filter resources using `includes` to match the items from the previous search
    // with how the backend will filter them.
    resources = settledResourcesRef.current.filter((item) => containsQuery(item, searchTerm))
  } else {
    const localMatches = searchItems(debouncedSearchTerm, localCatalog)

    // To prevent throwing away search results from the backend we keep non-matches for those items.
    resources = searchItems(debouncedSearchTerm, [...localMatches, ...searchedResources], {
      keepNonMatches: true,
    })

    settledResourcesRef.current = resources
  }

  const visibleNavigations = useMemo(
    () => filterNavigationsUserHasAccessTo(navigations, authorization),
    [authorization]
  )

  const { pages, actions } = useMemo(() => {
    const matches = searchItems(searchTerm, visibleNavigations.flatMap(toPageAndActionSearchItems))

    return {
      pages: matches.filter((item) => item.kind === "page"),
      actions: matches.filter((item) => item.kind === "action"),
    }
  }, [searchTerm, visibleNavigations])

  return {
    pages,
    actions,
    resources,
    isFetching,
  }
}

export function containsQuery(item: SearchItem, searchTerm: string): boolean {
  const resolvedSearchTerm = searchTerm.toLowerCase()

  return [item.label, ...item.keywords].some((value) => value.toLowerCase().includes(resolvedSearchTerm))
}
