"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconBuildingWarehouse, IconCalendarEvent } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { CompanyEventsPage } from "./company-page"
import { CompanyEditCard } from "./edit-card"
import { useCompanyDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconBuildingWarehouse,
    label: "Info",
    slug: "info",
    component: CompanyEditCard,
  },
  {
    icon: IconCalendarEvent,
    label: "Arrangementer",
    slug: "event",
    component: CompanyEventsPage,
  },
] as const

export default function CompanyDetailsPage() {
  const { company } = useCompanyDetailsContext()
  const router = useRouter()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{company.name}</Title>
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
