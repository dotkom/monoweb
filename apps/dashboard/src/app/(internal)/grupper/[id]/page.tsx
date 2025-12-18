"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconCircles, IconListDetails, IconUsers, IconWheelchair } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { GroupEditCard } from "./edit-card"
import { GroupEventPage } from "./group-event-page"
import { GroupMembersPage } from "./members-page"
import { useGroupDetailsContext } from "./provider"
import { GroupRolesPage } from "./roles-page"

const SIDEBAR_LINKS = [
  {
    icon: IconListDetails,
    label: "Info",
    slug: "info",
    component: GroupEditCard,
  },
  {
    icon: IconUsers,
    label: "Medlemmer",
    slug: "medlemmer",
    component: GroupMembersPage,
  },
  {
    icon: IconCircles,
    label: "Roller",
    slug: "roller",
    component: GroupRolesPage,
  },
  {
    icon: IconWheelchair,
    label: "Arrangementer",
    slug: "arrangementer",
    component: GroupEventPage,
  },
] as const

export default function GroupDetailsPage() {
  const router = useRouter()
  const { group } = useGroupDetailsContext()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/grupper/${group.slug}?${params.toString()}`)
  }

  return (
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{group.name}</Title>
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
