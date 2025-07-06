"use client"

import { Icon } from "@iconify/react"
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { OfflineEditCard } from "./edit-card"
import { useOfflineDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: "tabler:building-warehouse",
    label: "Info",
    slug: "info",
    component: OfflineEditCard,
  },
] as const

export default function OfflineDetailsPage() {
  const { offline } = useOfflineDetailsContext()
  const router = useRouter()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{offline.title}</Title>
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
