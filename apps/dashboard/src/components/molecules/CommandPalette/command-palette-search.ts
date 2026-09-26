import type { TablerIcon } from "@tabler/icons-react"

import type { Navigation } from "@/lib/navigation"

const CREATE_KEYWORDS = ["ny", "nytt", "opprett", "create"]

const KIND_ORDER = {
  page: 0,
  action: 1,
  resource: 2,
} as const

export type SearchItem = {
  id: string
  kind: "page" | "action" | "resource"
  label: string
  href: string
  icon: TablerIcon
  openInNewTab?: boolean
  keywords: string[]
  resourceId?: string
}

export function searchItems(
  searchTerm: string,
  items: SearchItem[],
  config: { keepNonMatches?: boolean } = {}
): SearchItem[] {
  if (searchTerm.trim().length === 0) {
    return items.filter((item) => item.kind !== "resource")
  }

  const scoredItems = items.map((item, catalogIndex) => ({ item, catalogIndex, score: scoreItem(searchTerm, item) }))

  return scoredItems
    .filter((result) => config.keepNonMatches || result.score > 0)
    .sort((left, right) => {
      // Always prioritize pages > actions > resources
      if (left.item.kind !== right.item.kind) {
        return kindRank(left.item.kind) - kindRank(right.item.kind)
      }

      if (right.score !== left.score) {
        return right.score - left.score
      }

      const kind = left.item.kind
      const lengthDiff = lowercase(left.item.label).length - lowercase(right.item.label).length

      // Resources don't have a meaningful catalog index, so we sort by length instead
      // Pages and actions stay sorted by nav index
      // Resources with a score of 0 are not reordered to preserve backend ordering
      if (kind === "resource" && left.score > 0 && lengthDiff !== 0) {
        return lengthDiff
      }

      return left.catalogIndex - right.catalogIndex
    })
    .map((result) => result.item)
}

export function toPageAndActionSearchItems(navigation: Navigation): SearchItem[] {
  const pageSearchItem: SearchItem = {
    id: `page:${navigation.href}`,
    kind: "page",
    label: navigation.label,
    href: navigation.href,
    icon: navigation.icon,
    openInNewTab: navigation.openInNewTab,
    keywords: navigation.keywords ?? [],
  }

  const actionSearchItems: SearchItem[] =
    navigation.createActions?.map((action) => {
      const resourceName = action.resourceName

      const keywords = CREATE_KEYWORDS.map((keyword) => [keyword, resourceName].join(" "))

      return {
        id: `action:${action.href}`,
        kind: "action",
        label: action.label,
        href: action.href,
        icon: navigation.icon,
        keywords,
      }
    }) ?? []

  return [pageSearchItem, ...actionSearchItems]
}

function scoreItem(searchTerm: string, item: SearchItem): number {
  const queryWords = words(searchTerm)
  const itemWords = [...words(item.label), ...item.keywords.flatMap(words)]

  // A match on resource id is a perfect match and will always be ranked higher than any other match.
  if (item.resourceId !== undefined && lowercase(item.resourceId) === lowercase(searchTerm)) {
    return 100
  }

  let score = 0
  for (const queryWord of queryWords) {
    const bestScore = bestWordScore(queryWord, itemWords)

    if (bestScore === 0) {
      return 0
    }

    score += bestScore
  }

  if (lowercase(item.label) === lowercase(searchTerm)) {
    score += 40
  }

  return score
}

function bestWordScore(queryWord: string, itemWords: string[]): number {
  let best = 0

  for (const itemWord of itemWords) {
    const score = wordScore(queryWord, itemWord)
    if (score > best) {
      best = score
    }
  }

  return best
}

const EDGE_PUNCTUATION = "()[]{}.,!?:;\"'-"

function lowercase(value: string): string {
  return value.normalize("NFC").toLowerCase()
}

function stripEdges(word: string): string {
  let start = 0
  let end = word.length

  while (start < end && EDGE_PUNCTUATION.includes(word[start])) {
    start += 1
  }

  while (end > start && EDGE_PUNCTUATION.includes(word[end - 1])) {
    end -= 1
  }

  return word.slice(start, end)
}

function words(value: string): string[] {
  return lowercase(value)
    .split(" ")
    .map(stripEdges)
    .filter((word) => word.length > 0)
}

function wordScore(queryWord: string, itemWord: string): number {
  if (queryWord === itemWord) {
    return 2
  }

  if (itemWord.startsWith(queryWord)) {
    return 1
  }

  return 0
}

function kindRank(kind: SearchItem["kind"]): number {
  return KIND_ORDER[kind]
}
