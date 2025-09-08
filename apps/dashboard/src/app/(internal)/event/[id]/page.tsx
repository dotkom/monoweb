"use client"

import { env } from "@/lib/env"
import { createAbsoluteEventPageUrl } from "@dotkomonline/utils"
import { Button, Group, Modal, Stack, Tabs, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconArrowLeft,
  IconArrowUpRight,
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
import { useRouter, useSearchParams } from "next/navigation"
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
    slug: "bedrifter",
    component: EventCompaniesPage,
  },
  {
    icon: IconForms,
    label: "Tilbakemeldingsskjema",
    slug: "tilbakemeldingsskjema",
    component: FeedbackPage,
  },
  {
    icon: IconCalendarEvent,
    label: "Påmelding",
    slug: "pamelding",
    component: AttendancePage,
  },
  {
    icon: IconUser,
    label: "Påmeldte",
    slug: "pameldte",
    component: AttendeesPage,
  },
  {
    icon: IconSelector,
    label: "Valg",
    slug: "valg",
    component: SelectionsPage,
  },
  {
    icon: IconCreditCard,
    label: "Betaling",
    slug: "betaling",
    component: PaymentPage,
  },
]

export default function EventWithAttendancesPage() {
  const { event, attendance } = useEventContext()
  const router = useRouter()

  const deleteEvent = useDeleteEventMutation()
  const [opened, { open, close }] = useDisclosure(false)

  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || SIDEBAR_LINKS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? SIDEBAR_LINKS[0].slug)
    router.replace(`/event/${event.id}?${params.toString()}`)
  }

  return (
    <Stack>
      <Group align="center">
        <Group>
          <Button
            variant="light"
            onClick={() => router.push("/event")}
            leftSection={<IconArrowLeft height={14} width={14} />}
          >
            Tilbake
          </Button>
          <Button
            variant="light"
            rightSection={<IconArrowUpRight height={14} width={14} />}
            component="a"
            href={createAbsoluteEventPageUrl(env.NEXT_PUBLIC_WEB_URL, event.id, event.title)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Se arrangementet
          </Button>
        </Group>

        <Group>
          <Modal opened={opened} onClose={close} title={`Er du sikker på at du vil slette ${event.title}?`} centered>
            <Group>
              <Button
                color="red"
                onClick={() => {
                  deleteEvent.mutate({ id: event.id })
                  router.back()
                }}
                leftSection={<IconTrash height={14} width={14} />}
              >
                Ja, slett
              </Button>
              <Button color="gray" onClick={close} leftSection={<IconCancel height={14} width={14} />}>
                Nei
              </Button>
            </Group>
          </Modal>

          <Button color="red" variant="light" onClick={open} leftSection={<IconTrash height={14} width={14} />}>
            Slett
          </Button>
        </Group>
      </Group>

      <Group>
        <Title>{event.title}</Title>
      </Group>

      <Tabs defaultValue={currentTab} onChange={handleTabChange} keepMounted={false}>
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
