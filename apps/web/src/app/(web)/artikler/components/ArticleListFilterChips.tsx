import { FilterChips, type FilterChip } from "@/components/molecules/ListFilters/FilterChips"

type FilterType = "search" | "tag"

interface ArticleListFilterChipsProps {
  searchTerm: string
  tagFilter: string[]
  onRemoveFilter: (filterType: FilterType, value?: string) => void
  onResetAll: () => void
}

export const ArticleListFilterChips = ({
  searchTerm,
  tagFilter,
  onRemoveFilter,
  onResetAll,
}: ArticleListFilterChipsProps) => {
  const chips: FilterChip[] = []

  if (searchTerm) {
    chips.push({ key: `search-${searchTerm}`, label: `'${searchTerm}'`, onRemove: () => onRemoveFilter("search") })
  }

  for (const tag of tagFilter) {
    chips.push({
      key: `tag-${tag}`,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      onRemove: () => onRemoveFilter("tag", tag),
    })
  }

  return <FilterChips chips={chips} onResetAll={onResetAll} />
}
