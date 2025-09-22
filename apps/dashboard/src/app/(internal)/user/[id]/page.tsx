"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import {
  IconBuildingWarehouse,
  IconCampfire,
  IconCircles,
  IconExclamationMark,
  IconWheelchair,
} from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserEditCard } from "./edit-card"
import { MembershipPage } from "./membership-page"
import { useUserDetailsContext } from "./provider"
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
    slug: "Grupper",
    component: UserGroupPage,
  },
  {
    icon: IconWheelchair,
    label: "Arrangementer",
    slug: "Arrangementer",
    component: UserEventPage,
  },
  {
    icon: IconExclamationMark,
    label: "Prikker & Suspensjoner",
    slug: "prikker-og-suspensjoner",
    component: UserPunishmentPage,
  },
] as const

export default function UserDetailsPage() {
  const { user } = useUserDetailsContext()
  const router = useRouter()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/user/${user.id}?${params.toString()}`)
  }

  return (
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{user.name}</Title>
      </Group>

      <Tabs defaultValue={currentTab} onChange={handleTabChange}>
        <Tabs.List>
          {SIDEBAR_LINKS.map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SIDEBAR_LINKS.map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  )
}
