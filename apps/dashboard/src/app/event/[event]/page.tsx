"use client"

import { Box, Button, Card, Grid, Group, Tabs, Title, useMantineTheme } from "@mantine/core"
import { Icon } from "@iconify/react"
import { FC } from "react"
import { useEventDetailsContext } from "./provider"
import Link from "next/link"
import { EventCompaniesPage } from "./EventCompaniesPage"
import { EventEditCard } from "./EventEditCard"

const EventDetailsCompanies: FC = () => {
  return <h1>Bedrifter</h1>
}

const EventDetailsFeedbackForms: FC = () => {
  return <h1>Tilbakemelding</h1>
}

const EventDetailsAttendance: FC = () => {
  return <h1>Påmelding</h1>
}

const SIDEBAR_LINKS = [
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
    component: EventDetailsAttendance,
  },
]

export default function EventDetailsPage() {
  const { event } = useEventDetailsContext()
  const theme = useMantineTheme()
  return (
    <Box p="md">
      <Group position="apart">
        <Title>{event.title}</Title>
        <Link href="/event">
          <Button variant="subtle" leftIcon={<Icon icon="tabler:arrow-back" />}>
            Tilbake til oversikt
          </Button>
        </Link>
      </Group>
      <Grid
        columns={2}
        gutter="md"
        styles={{
          backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[0] : theme.colors.gray[9],
        }}
      >
        <Grid.Col span={1}>
          <EventEditCard />
        </Grid.Col>
        <Grid.Col span={1}>
          <Card withBorder shadow="sm">
            <Tabs defaultValue={SIDEBAR_LINKS[0].slug}>
              <Tabs.List>
                {SIDEBAR_LINKS.map(({ label, icon, slug }) => (
                  <Tabs.Tab key={slug} value={slug} icon={<Icon icon={icon} width={14} height={14} />}>
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
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
