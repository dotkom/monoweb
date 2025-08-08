"use client"

import { Icon } from "@iconify/react"
import { Button, Group, Modal, Stack, Tabs, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import { useDeleteEventMutation } from "../mutations"
import { AttendancePage } from "./attendance-page"
import { AttendeesPage } from "./attendees-page"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"
import { FeedbackPage } from "./feedback-page"
import { useEventContext } from "./provider"
import { SelectionsPage } from "./selections-page"
import { PaymentPage } from "./payment-page"

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
    icon: "tabler:forms",
    label: "Tilbakemeldingsskjema",
    slug: "feedback-form",
    component: FeedbackPage,
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
    icon: "tabler:calendar-event",
    label: "Valg",
    slug: "selections",
    component: SelectionsPage,
  },
  {
    icon: "tabler:credit-card",
    label: "Betaling",
    slug: "payment",
    component: PaymentPage,
  },
]

export default function EventDetailsPage() {
  const event = useEventContext()
  const router = useRouter()

  const deleteEvent = useDeleteEventMutation()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <Stack>
      <Group>
        <Button bg="gray" onClick={() => router.back()} leftSection={<Icon icon="tabler:arrow-left" />}>
          Tilbake
        </Button>

        <Modal opened={opened} onClose={close} title={`Er du sikker på at du vil slette ${event.title}?`} centered>
          <Group>
            <Button
              bg="red"
              onClick={() => {
                deleteEvent.mutate({ id: event.id })
                router.back()
              }}
              leftSection={<Icon icon="tabler:trash" />}
            >
              Ja, slett
            </Button>
            <Button bg="gray" onClick={close} leftSection={<Icon icon="tabler:cancel" />}>
              Nei
            </Button>
          </Group>
        </Modal>

        <Button bg="red" onClick={open} leftSection={<Icon icon="tabler:trash" />}>
          Slett
        </Button>
      </Group>

      <Group>
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
    </Stack>
  )
}
