"use client"

import { Icon } from "@iconify/react"
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { EventCommitteesPage } from "./committees-page"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"
import { useEventDetailsContext } from "./provider"

const EventDetailsFeedbackForms: FC = () => {
  return <h1>Tilbakemelding</h1>
}

const EventDetailsAttendance: FC = () => {
  return <h1>Påmelding</h1>
}

const SIDEBAR_LINKS = [
  {
    icon: "tabler:list-details",
    label: "Info",
    slug: "info",
    component: EventEditCard,
  },
  {
    icon: "tabler:building-warehouse",
    label: "Bedrifter",
    slug: "event",
    component: EventCompaniesPage,
  },
  {
    icon: "tabler:tent",
    label: "Komiteer",
    slug: "committee",
    component: EventCommitteesPage,
  },
  {
    icon: "tabler:forms",
    label: "Tilbakemeldingsskjema",
    slug: "feedback-form",
    component: EventDetailsFeedbackForms,
  },
  {
    icon: "tabler:calendar-event",
    label: "Påmelding",
    slug: "attendance",
    component: EventDetailsAttendance,
  },
]

export default function EventDetailsPage() {
  const { event } = useEventDetailsContext()
  const router = useRouter()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{event.title}</Title>
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
