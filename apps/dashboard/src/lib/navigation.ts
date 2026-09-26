"use client"

import type { useAuthorization } from "@/auth/authorization-context"
import { GroupTypeSchema } from "@dotkomonline/rpc/group"
import {
  IconAward,
  IconBan,
  IconBell,
  IconBriefcase,
  IconCampfire,
  IconClipboardList,
  IconConfetti,
  IconMoneybag,
  IconPhoto,
  IconPhotoShare,
  IconSkull,
  IconUserMinus,
  IconUsersGroup,
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

// Keywords are used for search.
// For a `createAction` to display in search results,
// both the parent page and the action must be accessible to the user.
export const navigations: Navigation[] = [
  {
    label: "Arrangementer",
    icon: IconWheelchair,
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
    label: "Grupper",
    icon: IconCampfire,
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
    label: "Jobbutlysninger",
    icon: IconBriefcase,
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
    label: "Artikler",
    icon: IconPhoto,
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
    icon: IconSkull,
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
  {
    label: "Bedrifter",
    icon: IconMoneybag,
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
    label: "Avmeldingsgrunner",
    icon: IconUserMinus,
    href: "/avmeldingsgrunner",
    keywords: ["avmeldingsgrunn", "avmeldingsgrunner"],
  },
  { label: "Brukere", icon: IconUsersGroup, href: "/brukere", keywords: ["bruker", "brukere", "user", "users"] },
  {
    label: "Plakatbestilling",
    icon: IconPhotoShare,
    href: "https://fern-smelt-8a2.notion.site/1c7ae7670a5180f2ada1c29699a1f44f",
    openInNewTab: true,
  },
  {
    label: "Hendelseslogg",
    icon: IconClipboardList,
    href: "/logg",
    keywords: ["hendelseslogg", "logg", "audit"],
    canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canAccessAuditLog(),
  },
]

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
