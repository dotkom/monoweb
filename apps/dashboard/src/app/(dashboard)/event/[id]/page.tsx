"use client"

import { Icon } from "@iconify/react"
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { AttendancePage } from "./attendance-page"
import { AttendeesPage } from "./attendees-page"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"
import { ExtrasPage } from "./extras-page"
import { useEventDetailsContext } from "./provider"
import { WaitlistPage } from "./waitlist-page"

const EventDetailsCompanies: FC = () => <h1>Bedrifter</h1>

const EventDetailsFeedbackForms: FC = () => <h1>Tilbakemelding</h1>

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
    component: EventDetailsCompanies,
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
    component: AttendancePage,
  },
  {
    icon: "tabler:user",
    label: "Påmeldte",
    slug: "attendees",
    component: AttendeesPage,
  },
  {
    icon: "tabler:user",
    label: "Venteliste",
    slug: "attendee-waitlist",
    component: WaitlistPage,
  },
  {
    icon: "tabler:calendar-event",
    label: "Valg",
    slug: "extras",
    component: ExtrasPage,
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

      <Tabs defaultValue={SIDEBAR_LINKS[0].slug} keepMounted={false}>
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
