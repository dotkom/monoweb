"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
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
import { useIsAdminQuery } from "../queries"
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
    isAdmin: true,
  },
] satisfies {
  label: string
  slug: string
  icon: FC
  component: FC
  isAdmin?: boolean
}[]

export default function UserDetailsPage() {
  const { user } = useUserDetailsContext()
  const { isAdmin } = useIsAdminQuery()
  const router = useRouter()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/brukere/${user.id}?${params.toString()}`)
  }

  return (
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{user.name}</Title>
      </Group>

      <Tabs defaultValue={currentTab} onChange={handleTabChange}>
        <Tabs.List>
          {SIDEBAR_LINKS.filter((link) => !link.isAdmin || isAdmin).map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SIDEBAR_LINKS.filter((link) => !link.isAdmin || isAdmin).map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  )
}
