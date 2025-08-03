"use client"

import { Icon } from "@iconify/react"
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { GroupEditCard } from "./edit-card"
import { GroupMembersPage } from "./members-page"
import { useGroupDetailsContext } from "./provider"
import { GroupRolesPage } from "./roles-page"

const SIDEBAR_LINKS = [
  {
    icon: "tabler:list-details",
    label: "Info",
    slug: "info",
    component: GroupEditCard,
  },
  {
    icon: "tabler:users",
    label: "Medlemmer",
    slug: "memberships",
    component: GroupMembersPage,
  },
  {
    icon: "tabler:circles",
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
          {SIDEBAR_LINKS.map(({ label, icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon icon={icon} width={14} height={14} />}>
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
