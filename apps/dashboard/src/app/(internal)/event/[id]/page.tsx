"use client"

import { Button, Group, Modal, Stack, Tabs, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconArrowLeft,
  IconBuildingWarehouse,
  IconCalendarEvent,
  IconCancel,
  IconCreditCard,
  IconForms,
  IconListDetails,
  IconSelector,
  IconTrash,
  IconUser,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useDeleteEventMutation } from "../mutations"
import { AttendancePage } from "./attendance-page"
import { AttendeesPage } from "./attendees-page"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"
import { FeedbackPage } from "./feedback-page"
import { PaymentPage } from "./payment-page"
import { useEventContext } from "./provider"
import { SelectionsPage } from "./selections-page"

const SIDEBAR_LINKS = [
  {
    icon: IconListDetails,
    label: "Info",
    slug: "info",
    component: EventEditCard,
  },
  {
    icon: IconBuildingWarehouse,
    label: "Bedrifter",
    slug: "event",
    component: EventCompaniesPage,
  },
  {
    icon: IconForms,
    label: "Tilbakemeldingsskjema",
    slug: "feedback-form",
    component: FeedbackPage,
  },
  {
    icon: IconCalendarEvent,
    label: "Påmelding",
    slug: "attendance",
    component: AttendancePage,
  },
  {
    icon: IconUser,
    label: "Påmeldte",
    slug: "attendees",
    component: AttendeesPage,
  },
  {
    icon: IconSelector,
    label: "Valg",
    slug: "selections",
    component: SelectionsPage,
  },
  {
    icon: IconCreditCard,
    label: "Betaling",
    slug: "payment",
    component: PaymentPage,
  },
]

export default function EventWithAttendancesPage() {
  const { event, attendance } = useEventContext()
  const router = useRouter()

  const deleteEvent = useDeleteEventMutation()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <Stack>
      <Group>
        <Button bg="gray" onClick={() => router.back()} leftSection={<IconArrowLeft height={14} width={14} />}>
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
              leftSection={<IconTrash height={14} width={14} />}
            >
              Ja, slett
            </Button>
            <Button bg="gray" onClick={close} leftSection={<IconCancel height={14} width={14} />}>
              Nei
            </Button>
          </Group>
        </Modal>

        <Button bg="red" onClick={open} leftSection={<IconTrash height={14} width={14} />}>
          Slett
        </Button>
      </Group>

      <Group>
        <Title>{event.title}</Title>
      </Group>

      <Tabs defaultValue={SIDEBAR_LINKS[0].slug} keepMounted={false}>
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
    </Stack>
  )
}
