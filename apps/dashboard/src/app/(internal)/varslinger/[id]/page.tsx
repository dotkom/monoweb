"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconListDetails, IconUsers } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { NotificationEditCard } from "./edit-card"
import { NotificationRecipientsPage } from "./recipients-page"
import { useNotificationDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconListDetails,
    label: "Info",
    slug: "info",
    component: NotificationEditCard,
  },
  {
    icon: IconUsers,
    label: "Mottakere",
    slug: "mottakere",
    component: NotificationRecipientsPage,
  },
] as const

export default function NotificationDetailsPage() {
  const { notification } = useNotificationDetailsContext()
  const router = useRouter()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/varslinger/${notification.id}?${params.toString()}`)
  }

  return (
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{notification.title}</Title>
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
