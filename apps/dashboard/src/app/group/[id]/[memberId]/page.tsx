"use client"

import { Icon } from "@iconify/react"
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { GroupMemberEditCard } from "./edit-card"
import { useGroupMemberDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: "tabler:list-details",
    label: "Info",
    slug: "info",
    component: GroupMemberEditCard,
  },
] as const

export default function GroupMemberDetailsPage() {
  const router = useRouter()
  const { groupMember } = useGroupMemberDetailsContext()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{groupMember.name}</Title>
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
