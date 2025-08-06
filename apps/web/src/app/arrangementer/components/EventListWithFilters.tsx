"use client"

import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventList } from "@/components/organisms/EventList"
import type { EventFilterQuery, UserId } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import { getCurrentUtc } from "@dotkomonline/utils"
import { useMemo, useState } from "react"
import { EventFilters } from "./EventFilters"
import { useEventAllQuery } from "./queries"

interface Props {
    userId: UserId | undefined
}

export const EventListWithFilters = ({ userId }: Props) => {
    const [filter, setFilter] = useState<EventFilterQuery>()

    const now = useMemo(() => getCurrentUtc(), []);
    const { events: futureEvents } = useEventAllQuery({
        filter: {
            ...filter,
            byEndDate: {
                max: null,
                min: now,
            },
        },
        page: {
            take: 1000
        }
    })

    const { events: pastEvents, fetchNextPage } = useEventAllQuery({
        filter: {
            ...filter,
            byEndDate: {
                max: now,
                min: null,
            },
        },
        page: {
            take: 1
        }
    })

    return (
        <div className="flex flex-col gap-4">
            <Title element="h1" size="xl">
                Arrangementer
            </Title>

            <div className="flex flex-col gap-4">
                <EventsViewToggle active="list" />
                <EventFilters onChange={setFilter} />
                <EventList userId={userId} events={[...futureEvents, ...pastEvents]} fetchNextPage={fetchNextPage} />
            </div>
        </div>
    )
}
