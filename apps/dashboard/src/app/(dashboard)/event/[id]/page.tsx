"use client";

import { Icon } from "@iconify/react";
import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { type FC } from "react";

import { EventCompaniesPage } from "./companies-page";
import { EventEditCard } from "./edit-card";
import { useEventDetailsContext } from "./provider";

const EventDetailsCompanies: FC = () => <h1>Bedrifter</h1>;

const EventDetailsFeedbackForms: FC = () => <h1>Tilbakemelding</h1>;

const EventDetailsAttendance: FC = () => <h1>Påmelding</h1>;

const SIDEBAR_LINKS = [
    {
        component: EventEditCard,
        icon: "tabler:list-details",
        label: "Info",
        slug: "info",
    },
    {
        component: EventCompaniesPage,
        icon: "tabler:building-warehouse",
        label: "Bedrifter",
        slug: "event",
    },
    {
        component: EventDetailsCompanies,
        icon: "tabler:tent",
        label: "Komiteer",
        slug: "committee",
    },
    {
        component: EventDetailsFeedbackForms,
        icon: "tabler:forms",
        label: "Tilbakemeldingsskjema",
        slug: "feedback-form",
    },
    {
        component: EventDetailsAttendance,
        icon: "tabler:calendar-event",
        label: "Påmelding",
        slug: "attendance",
    },
];

export default function EventDetailsPage() {
    const { event } = useEventDetailsContext();
    const router = useRouter();

    return (
        <Box p="md">
            <Group>
                <CloseButton onClick={() => router.back()} />
                <Title>{event.title}</Title>
            </Group>

            <Tabs defaultValue={SIDEBAR_LINKS[0].slug}>
                <Tabs.List>
                    {SIDEBAR_LINKS.map(({ icon, label, slug }) => (
                        <Tabs.Tab key={slug} leftSection={<Icon height={14} icon={icon} width={14} />} value={slug}>
                            {label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
                {SIDEBAR_LINKS.map(({ component: Component, slug }) => (
                    <Tabs.Panel key={slug} mt="md" value={slug}>
                        <Component />
                    </Tabs.Panel>
                ))}
            </Tabs>
        </Box>
    );
}
