"use client"

import type { useAuthorization } from "@/auth/authorization-context"
import { GroupTypeSchema } from "@dotkomonline/rpc/group"
import {
  IconArticle,
  IconAward,
  IconBan,
  IconBell,
  IconBriefcase,
  IconClipboardList,
  IconConfetti,
  IconDeviceMobileShare,
  IconHeartHandshake,
  IconPhotoShare,
  IconSitemap,
  IconSkull,
  IconUserMinus,
  IconUsers,
  IconWheelchair,
  type TablerIcon,
} from "@tabler/icons-react"

export type Navigation = {
  label: string
  icon: TablerIcon
  href: string
  openInNewTab?: boolean
  keywords?: string[]
  createActions?: {
    label: string
    href: string
    resourceName: string
    canAccess?: (authorization: ReturnType<typeof useAuthorization>) => boolean
  }[]
  canAccess?: (authorization: ReturnType<typeof useAuthorization>) => boolean
}

export type NavigationGroup = {
  label?: string
  items: Navigation[]
}

// Keywords are used for search.
// For a `createAction` to display in search results,
// both the parent page and the action must be accessible to the user.
export const navigationGroups: NavigationGroup[] = [
  {
    label: "Arrangementer",
    items: [
      {
        label: "Arrangementer",
        icon: IconWheelchair, // This is sacred and shall not be changed
        href: "/arrangementer",
        keywords: ["arrangement", "arrangementer", "event", "events"],
        createActions: [
          {
            label: "Nytt arrangement",
            href: "/arrangementer/ny",
            resourceName: "arrangement",
            canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canCreateEvents(),
          },
        ],
      },
      {
        label: "Prikker og suspensjoner",
        icon: IconBan,
        href: "/prikker",
        keywords: ["prikk", "prikker", "suspensjon", "suspensjoner", "mark", "marks"],
        createActions: [
          {
            label: "Ny prikk",
            href: "/prikker?create=prikk",
            resourceName: "prikk",
          },
          {
            label: "Ny suspensjon",
            href: "/prikker?create=suspensjon",
            resourceName: "suspensjon",
          },
        ],
      },
      {
        label: "Konkurranser",
        icon: IconAward,
        href: "/konkurranser",
        keywords: ["konkurranse", "konkurranser"],
        createActions: [
          {
            label: "Ny konkurranse",
            href: "/konkurranser/ny",
            resourceName: "konkurranse",
          },
        ],
      },
      {
        label: "Avmeldingsgrunner",
        icon: IconUserMinus,
        href: "/avmeldingsgrunner",
        keywords: ["avmeldingsgrunn", "avmeldingsgrunner"],
      },
    ],
  },
  {
    label: "Katalog",
    items: [
      {
        label: "Brukere",
        icon: IconUsers,
        href: "/brukere",
        keywords: ["bruker", "brukere", "user", "users"],
      },
      {
        label: "Grupper",
        icon: IconSitemap,
        href: "/grupper",
        keywords: ["gruppe", "grupper", "group", "groups"],
        createActions: [
          {
            label: "Ny gruppe",
            href: "/grupper/ny",
            resourceName: "gruppe",
            canAccess: (authorization: ReturnType<typeof useAuthorization>) =>
              Object.values(GroupTypeSchema.enum).some((type) => authorization.canCreateGroup(type)),
          },
        ],
      },
    ],
  },
  {
    label: "Bedrifter",
    items: [
      {
        label: "Jobbutlysninger",
        icon: IconHeartHandshake,
        href: "/karriere",
        keywords: ["jobb", "jobbannonser", "karriere", "jobs"],
        createActions: [
          {
            label: "Ny jobbannonse",
            href: "/karriere/ny",
            resourceName: "jobbannonse",
          },
        ],
      },
      {
        label: "Bedrifter",
        icon: IconBriefcase,
        href: "/bedrifter",
        keywords: ["bedrift", "bedrifter", "company", "companies"],
        createActions: [
          {
            label: "Ny bedrift",
            href: "/bedrifter/ny",
            resourceName: "bedrift",
          },
        ],
      },
    ],
  },
  {
    label: "Redaksjonelt",
    items: [
      {
        label: "Artikler",
        icon: IconArticle,
        href: "/artikler",
        keywords: ["artikkel", "artikler"],
        createActions: [
          {
            label: "Ny artikkel",
            href: "/artikler/ny",
            resourceName: "artikkel",
          },
        ],
      },
      {
        label: "Offline",
        icon: IconSkull, // This is sacred and shall not be changed
        href: "/offline",
        keywords: ["offline"],
        canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canEditOffline(),
        createActions: [
          {
            label: "Ny offline",
            href: "/offline/ny",
            resourceName: "offline",
          },
        ],
      },
    ],
  },
  {
    label: "Medier",
    items: [
      {
        label: "Plakatbestilling",
        icon: IconPhotoShare,
        href: "https://fern-smelt-8a2.notion.site/1c7ae7670a5180f2ada1c29699a1f44f",
        openInNewTab: true,
      },
      {
        label: "SoMe-bestilling",
        icon: IconDeviceMobileShare,
        href: "https://fern-smelt-8a2.notion.site/3e9ae7670a518023ab1bdc4e5214d8c3",
        openInNewTab: true,
      },
    ],
  },
  {
    label: "Annet",
    items: [
      {
        label: "Varslinger",
        icon: IconBell,
        href: "/varslinger",
        keywords: ["varsling", "varslinger"],
        createActions: [
          {
            label: "Ny varsling",
            href: "/varslinger?create=varsling",
            resourceName: "varsling",
          },
        ],
      },
      {
        label: "Fadderukene",
        icon: IconConfetti,
        href: "/fadderukene",
        keywords: ["fadderuke", "fadderuker", "fadderukene"],
        canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canEditFadderuke(),
        createActions: [
          {
            label: "Ny fadderuke",
            href: "/fadderukene/ny",
            resourceName: "fadderuke",
          },
        ],
      },
      {
        label: "Hendelseslogg",
        icon: IconClipboardList,
        href: "/logg",
        keywords: ["hendelseslogg", "logg", "audit"],
        canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canAccessAuditLog(),
      },
    ],
  },
]

export const navigations = navigationGroups.flatMap((group) => group.items)

export function filterNavigationsUserHasAccessTo(
  navigations: Navigation[],
  authorization: ReturnType<typeof useAuthorization>
) {
  return navigations
    .filter((navigation) => navigation.canAccess === undefined || navigation.canAccess(authorization))
    .map((page) => {
      const { createActions, ...pageData } = page
      const createActionsUserHasAccessTo = createActions?.filter(
        (action) => action.canAccess === undefined || action.canAccess(authorization)
      )

      return {
        ...pageData,
        createActions: createActionsUserHasAccessTo,
      }
    })
}

export function filterNavigationGroupsUserHasAccessTo(
  groups: NavigationGroup[],
  authorization: ReturnType<typeof useAuthorization>
) {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavigationsUserHasAccessTo(group.items, authorization),
    }))
    .filter((group) => group.items.length > 0)
}
