"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconBuildingWarehouse, IconCalendarEvent } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { CompanyEventPage } from "./company-event-page"
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
    slug: "arrangementer",
    component: CompanyEventPage,
  },
] as const

export default function CompanyDetailsPage() {
  const { company } = useCompanyDetailsContext()
  const router = useRouter()

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/company/${company.slug}?${params.toString()}`)
  }

  return (
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{company.name}</Title>
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
