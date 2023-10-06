"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { Icon } from "@iconify/react"
import { FC } from "react"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"
import { useRouter } from "next/navigation"
import { useCompanyDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: "tabler:building-warehouse",
    label: "Info",
    slug: "info",
    component: EventEditCard,
  },
  {
    icon: "tabler:building-warehouse",
    label: "Arrangementer",
    slug: "event",
    component: EventCompaniesPage,
  },
]

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
