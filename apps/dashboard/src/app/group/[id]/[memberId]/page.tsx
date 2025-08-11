"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconListDetails } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { GroupMemberEditCard } from "./edit-card"
import { useGroupMemberDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconListDetails,
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
