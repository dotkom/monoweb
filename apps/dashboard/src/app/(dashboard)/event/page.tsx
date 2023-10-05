"use client";

import { type Event } from "@dotkomonline/types";
import { Icon } from "@iconify/react";
import {
    Anchor,
    Button,
    ButtonGroup,
    Card,
    Group,
    Skeleton,
    Stack,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
} from "@mantine/core";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

import { useCommitteeAllQuery } from "../../../modules/committee/queries/use-committee-all-query";
import { useCreateEventModal } from "../../../modules/event/modals/create-event-modal";
import { useEventAllQuery } from "../../../modules/event/queries/use-event-all-query";
import { formatDate } from "../../../utils/format";

export default function EventPage() {
    const { events, isLoading: isEventsLoading } = useEventAllQuery();
    const { committees, isLoading: isCommitteesLoading } = useCommitteeAllQuery();
    const open = useCreateEventModal();

    const columnHelper = createColumnHelper<Event>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("title", {
                header: () => "Arrangementnavn",
            }),
            columnHelper.accessor("start", {
                cell: (info) => formatDate(info.getValue()),
                header: () => "Startdato",
            }),
            columnHelper.accessor("committeeId", {
                cell: (info) => {
                    const match = committees.find((committee) => committee.id === info.getValue()) ?? null;

                    if (match !== null) {
                        return (
                            <Anchor href={`/committee/${match.id}`} size="sm">
                                {match.name}
                            </Anchor>
                        );
                    }

                    return "Ukjent arrangør";
                },
                header: () => "Arrangør",
            }),
            columnHelper.accessor("type", {
                header: () => "Type",
            }),
            columnHelper.accessor((evt) => evt, {
                cell: (info) => (
                    <Anchor href={`/event/${info.getValue().id}`} size="sm">
                        Se mer
                    </Anchor>
                ),
                header: () => "Detaljer",
                id: "actions",
            }),
        ],
        [committees, columnHelper]
    );

    const table = useReactTable({
        columns,
        data: events,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Skeleton visible={isEventsLoading || isCommitteesLoading}>
            <Stack>
                <Card withBorder>
                    <Table>
                        <TableThead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableTr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableTh key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableTh>
                                    ))}
                                </TableTr>
                            ))}
                        </TableThead>
                        <TableTbody>
                            {table.getRowModel().rows.map((row) => (
                                <TableTr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableTd key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableTd>
                                    ))}
                                </TableTr>
                            ))}
                        </TableTbody>
                    </Table>
                </Card>
                <Group justify="space-between">
                    <Button onClick={open}>Opprett arrangement</Button>
                    <ButtonGroup>
                        <Button variant="subtle">
                            <Icon icon="tabler:caret-left" />
                        </Button>
                        <Button variant="subtle">
                            <Icon icon="tabler:caret-right" />
                        </Button>
                    </ButtonGroup>
                </Group>
            </Stack>
        </Skeleton>
    );
}
