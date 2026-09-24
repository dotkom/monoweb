import { useAuthorization } from "@/auth/authorization-context"
import { useTRPC } from "@/lib/trpc-client"
import { keepPreviousData, useQueries } from "@tanstack/react-query"

const DEFAULT_TAKE = 5

interface UseCommandPaletteSearchQueryProps {
  searchTerm: string
  disabled?: boolean
}

export const useCommandPaletteSearchQuery = ({ searchTerm, disabled }: UseCommandPaletteSearchQueryProps) => {
  const trpc = useTRPC()

  const enabled = !disabled

  const queryResults = useQueries({
    queries: [
      {
        ...trpc.event.allSummaries.queryOptions({
          filter: {
            bySearchTerm: searchTerm,
            byStatus: ["PUBLIC", "DRAFT"],
            excludingType: [],
          },
          take: DEFAULT_TAKE,
        }),
        placeholderData: keepPreviousData,
        enabled,
      },
      {
        ...trpc.notification.findMany.queryOptions({ filters: { bySearchTerm: searchTerm }, take: DEFAULT_TAKE }),
        placeholderData: keepPreviousData,
        enabled,
      },
      {
        ...trpc.mark.findMany.queryOptions({ filter: { bySearchTerm: searchTerm }, take: DEFAULT_TAKE }),
        placeholderData: keepPreviousData,
        enabled,
      },
      {
        ...trpc.jobListing.findMany.queryOptions({ filter: { bySearchTerm: searchTerm }, take: DEFAULT_TAKE }),
        placeholderData: keepPreviousData,
        enabled,
      },
      {
        ...trpc.company.findMany.queryOptions({ filter: { bySearchTerm: searchTerm }, take: DEFAULT_TAKE }),
        placeholderData: keepPreviousData,
        enabled,
      },
      {
        ...trpc.user.all.queryOptions({ filter: { byName: searchTerm, byEmail: searchTerm }, take: DEFAULT_TAKE }),
        placeholderData: keepPreviousData,
        enabled,
      },
    ],
  })

  const [
    { data: eventsData },
    { data: notificationsData },
    { data: marksData },
    { data: jobListingsData },
    { data: companiesData },
    { data: usersData },
  ] = queryResults

  if (!enabled) {
    return {
      events: [],
      notifications: [],
      marks: [],
      jobListings: [],
      companies: [],
      users: [],
      isFetching: false,
    }
  }

  return {
    events: eventsData?.items ?? [],
    notifications: notificationsData?.items ?? [],
    marks: marksData?.items ?? [],
    jobListings: jobListingsData?.items ?? [],
    companies: companiesData?.items ?? [],
    users: usersData?.items ?? [],
    isFetching: queryResults.some((query) => query.isFetching),
  }
}

interface UseCommandPaletteCatalogQueryProps {
  disabled?: boolean
}

export const useCommandPaletteCatalogQuery = ({ disabled }: UseCommandPaletteCatalogQueryProps) => {
  const trpc = useTRPC()
  const authorization = useAuthorization()

  const enabled = !disabled

  const [
    { data: groupsData },
    { data: contestsData },
    { data: articlesData },
    { data: offlinesData },
    { data: fadderukeneData },
  ] = useQueries({
    queries: [
      {
        ...trpc.group.all.queryOptions({ filter: { includeEmailGroups: true } }),
        enabled,
      },
      {
        ...trpc.contest.findMany.queryOptions(),
        enabled,
      },
      {
        ...trpc.article.all.queryOptions(),
        enabled,
      },
      {
        ...trpc.offline.all.queryOptions(),
        enabled: enabled && authorization.canEditOffline(),
      },
      {
        ...trpc.fadderuke.findMany.queryOptions(),
        enabled: enabled && authorization.canEditFadderuke(),
      },
    ],
  })

  return {
    groups: groupsData ?? [],
    contests: contestsData ?? [],
    articles: articlesData ?? [],
    offlines: offlinesData ?? [],
    fadderukene: fadderukeneData ?? [],
  }
}
