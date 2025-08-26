"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconBuildingWarehouse, IconCircles } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { UserEditCard } from "./edit-card"
import { MembershipPage } from "./membership-page"
import { useUserDetailsContext } from "./provider"

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
    slug: "Membership",
    component: MembershipPage,
  },
] as const

export default function UserDetailsPage() {
  const { user } = useUserDetailsContext()
  const router = useRouter()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{user.name}</Title>
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
