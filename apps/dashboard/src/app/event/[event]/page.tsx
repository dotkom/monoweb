"use client"

import { Box, Button, Card, Grid, Group, Tabs, Text, Title, useMantineTheme } from "@mantine/core"
import { trpc } from "../../../trpc"
import { useEventWriteForm } from "../Form"
import { EventWriteSchema } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { FC } from "react"
import { EventDetailsCommittees } from "./EventCommitteeDetailsForm"
import { useEventDetailsContext } from "./provider"
import Link from "next/link"

const EventDetailsCompanies: FC = () => {
  return <h1>Companies</h1>
}

const SIDEBAR_LINKS = [
  {
    icon: "tabler:building-warehouse",
    label: "Bedrifter",
    slug: "event",
    component: EventDetailsCommittees,
  },
  {
    icon: "tabler:tent",
    label: "Komiteer",
    slug: "committee",
    component: EventDetailsCompanies,
  },
]

export default function EventDetailsPage() {
  const { event } = useEventDetailsContext()
  const theme = useMantineTheme()
  const utils = trpc.useContext()
  const edit = trpc.event.edit.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const FormComponent = useEventWriteForm(
    (data) => {
      const result = EventWriteSchema.required({ id: true }).parse(data)
      edit.mutate(result)
    },
    { ...event },
    "Oppdater arrangement"
  )
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
          <Card withBorder shadow="sm">
            <Text>Endre arrangement</Text>
            {FormComponent}
          </Card>
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
                <Tabs.Panel key={slug} value={slug}>
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
