"use client"

import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { useAuthorization } from "@/auth/authorization-context"
import { CloseButton, Group, Stack, Tabs, Title } from "@mantine/core"
import {
  IconBuildingWarehouse,
  IconCampfire,
  IconCircles,
  IconClipboardList,
  IconExclamationMark,
  IconWheelchair,
} from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import type { FC } from "react"
import { useEffect, useMemo } from "react"
import { useUserEditPermission } from "@/hooks/use-user-edit-permission"
import { UserEditCard } from "./edit-card"
import { MembershipPage } from "./membership-page"
import { useUserDetailsContext } from "./provider"
import { UserAuditLogPage } from "./user-audit-log-page"
import { UserEventPage } from "./user-event-page"
import { UserGroupPage } from "./user-group-page"
import { UserPunishmentPage } from "./user-punishment-page"

const SIDEBAR_LINKS = [
  {
    icon: IconBuildingWarehouse,
    label: "Info",
    slug: "info",
    component: UserEditCard,
  },
  {
    icon: IconCircles,
    label: "Medlemskap",
    slug: "medlemskap",
    component: MembershipPage,
  },
  {
    icon: IconCampfire,
    label: "Grupper",
    slug: "grupper",
    component: UserGroupPage,
  },
  {
    icon: IconWheelchair,
    label: "Arrangementer",
    slug: "arrangementer",
    component: UserEventPage,
  },
  {
    icon: IconExclamationMark,
    label: "Prikker & Suspensjoner",
    slug: "prikker-og-suspensjoner",
    component: UserPunishmentPage,
  },
  {
    icon: IconClipboardList,
    label: "Hendelseslogg",
    slug: "hendelseslogg",
    component: UserAuditLogPage,
    canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canAccessAuditLog(),
  },
] satisfies {
  label: string
  slug: string
  icon: FC
  component: FC
  canAccess?: (authorization: ReturnType<typeof useAuthorization>) => boolean
}[]

export default function UserDetailsPage() {
  const { user } = useUserDetailsContext()
  const authorization = useAuthorization()
  const { canEdit } = useUserEditPermission()
  const canManageMemberships = authorization.canManageUserMemberships()
  const router = useRouter()

  const searchParams = useSearchParams()
  const tabFromQuery = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const accessibleLinks = useMemo(
    () => SIDEBAR_LINKS.filter((link) => link.canAccess?.(authorization) ?? true),
    [authorization]
  )

  const currentTab = accessibleLinks.some((link) => link.slug === tabFromQuery) ? tabFromQuery : SIDEBAR_LINKS[0].slug

  useEffect(() => {
    if (tabFromQuery === currentTab) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", currentTab)
    router.replace(`/brukere/${user.id}?${params.toString()}`)
  }, [currentTab, router, searchParams, tabFromQuery, user.id])

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/brukere/${user.id}?${params.toString()}`)
  }

  return (
    <Stack>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{user.name}</Title>
      </Group>

      {currentTab !== "medlemskap" && !canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere denne brukerprofilen."
          message="Dette er fordi du kun kan redigere din egen profil."
        />
      )}

      {currentTab === "medlemskap" && !canManageMemberships && (
        <ReadOnlyNotice
          title="Du kan ikke redigere medlemskap."
          message="Dette er fordi du ikke er administrator. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tabs.List>
          {accessibleLinks.map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {accessibleLinks.map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
