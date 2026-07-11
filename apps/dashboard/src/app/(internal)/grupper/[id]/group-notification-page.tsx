"use client"

import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { GenericTable } from "@/components/GenericTable"
import { DateTooltip } from "@/components/DateTooltip"
import { useGroupPermissions } from "@/hooks/use-group-permissions"
import { mapNotificationPayloadTypeToLabel, mapNotificationTypeToLabel, type Notification } from "@dotkomonline/rpc"
import { Anchor, Box, Button, Skeleton, Stack, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { type FC, useMemo } from "react"
import { useNotificationsByPayloadQuery } from "../../arrangementer/queries"
import { openCreateGroupNotificationModal } from "../modals/create-group-notification-modal"
import { useGroupDetailsContext } from "./provider"

export const GroupNotificationPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const { canEdit } = useGroupPermissions()
  const { notifications, isLoading } = useNotificationsByPayloadQuery("GROUP", group.slug)

  const columnHelper = createColumnHelper<Notification>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((notification) => notification.title, {
        id: "title",
        header: () => "Tittel",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/varslinger/${info.row.original.id}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor((notification) => notification.shortDescription, {
        id: "shortDescription",
        header: () => "Kort beskrivelse",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((notification) => notification.type, {
        id: "type",
        header: () => "Type",
        cell: (info) => mapNotificationTypeToLabel(info.getValue()),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((notification) => notification.payloadType, {
        id: "payloadType",
        header: () => "Payload type",
        cell: (info) => mapNotificationPayloadTypeToLabel(info.getValue()),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((notification) => notification.createdAt, {
        id: "createdAt",
        header: () => "Opprettet",
        cell: (info) => <DateTooltip date={info.getValue()} />,
        sortingFn: "datetime",
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: notifications,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [notifications, columns]
  )

  const table = useReactTable(tableOptions)

  return (
    <Skeleton visible={isLoading}>
      <Stack gap="lg">
        {!canEdit && (
          <ReadOnlyNotice
            title="Du kan ikke opprette varslinger for denne gruppen."
            message="Dette er fordi du ikke er medlem av gruppen. Kontakt dotkom dersom du mener dette er en feil."
          />
        )}

        <Box>
          <Title order={3}>Opprett varsling</Title>
          <PermissionTooltip
            allowed={canEdit}
            label="Du kan ikke opprette varslinger for denne gruppen"
          >
            <Button
              mt="md"
              onClick={openCreateGroupNotificationModal({ groupSlug: group.slug })}
              disabled={!canEdit}
            >
              Legg til ny varsling
            </Button>
          </PermissionTooltip>
        </Box>

        <Box>
          <Title order={2}>Varslinger</Title>
          <GenericTable table={table} />
        </Box>
      </Stack>
    </Skeleton>
  )
}
