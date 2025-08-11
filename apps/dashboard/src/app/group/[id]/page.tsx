"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconCircles, IconListDetails, IconUsers } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { GroupEditCard } from "./edit-card"
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
    slug: "memberships",
    component: GroupMembersPage,
  },
  {
    icon: IconCircles,
    label: "Roller",
    slug: "roles",
    component: GroupRolesPage,
  },
] as const

export default function GroupDetailsPage() {
  const router = useRouter()
  const { group } = useGroupDetailsContext()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{group.name}</Title>
      </Group>

      <Tabs defaultValue={SIDEBAR_LINKS[0].slug}>
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
