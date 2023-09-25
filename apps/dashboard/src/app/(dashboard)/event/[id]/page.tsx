"use client"

import { Box, Button, Card, Grid, Group, Tabs, Title } from "@mantine/core"
import { Icon } from "@iconify/react"
import { FC } from "react"
import { useEventDetailsContext } from "./provider"
import Link from "next/link"
import { EventCompaniesPage } from "./companies-page"
import { EventEditCard } from "./edit-card"

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
    return (
        <Box p="md">
            <Group justify="apart">
                <Title>{event.title}</Title>
                <Link href="/event">
                    <Button variant="subtle" leftSection={<Icon icon="tabler:arrow-back" />}>
                        Tilbake til oversikt
                    </Button>
                </Link>
            </Group>
            <Grid
                columns={2}
                gutter="md"
            >
                <Grid.Col span={1}>
                    <EventEditCard />
                </Grid.Col>
                <Grid.Col span={1}>
                    <Card withBorder shadow="sm">
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
                    </Card>
                </Grid.Col>
            </Grid>
        </Box>
    )
}