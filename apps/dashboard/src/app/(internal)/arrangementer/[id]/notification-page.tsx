"use client"

import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { GenericTable } from "@/components/GenericTable"
import { DateTooltip } from "@/components/DateTooltip"
import { useAuthorization } from "@/auth/authorization-context"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import { useTRPC } from "@/lib/trpc-client"
import {
  mapNotificationPayloadTypeToLabel,
  mapNotificationTypeToLabel,
  type Notification,
  type NotificationType,
} from "@dotkomonline/rpc"
import { Anchor, Box, Button, Group, Skeleton, Stack, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { slugify } from "@dotkomonline/utils"
import { skipToken, useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { type FC, useMemo } from "react"
import { openCreateEventNotificationModal } from "../components/create-event-notification-modal"
import { useNotificationsByPayloadQuery } from "../queries"
import { useEventContext } from "./provider"

export const NotificationsPage: FC = () => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const { affiliations, isAdministrator } = useAuthorization()
  const trpc = useTRPC()
  const attendanceId = event.attendanceId ?? undefined
  const eventPath = `${slugify(event.title)}/${event.id}`
  const { notifications, isLoading } = useNotificationsByPayloadQuery("EVENT", eventPath)

  const { data: attendance, isLoading: isAttendanceLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      attendanceId !== undefined ? { id: attendanceId } : skipToken
    )
  )

  const hostingGroups = useMemo(
    () =>
      event.hostingGroups.map((group) => ({
        slug: group.slug,
        label: group.abbreviation,
      })),
    [event.hostingGroups]
  )

  const eligibleGroupSlugs = useMemo(() => {
    if (isAdministrator) {
      return hostingGroups.map((group) => group.slug)
    }

    return hostingGroups.map((group) => group.slug).filter((slug) => affiliations.has(slug))
  }, [affiliations, hostingGroups, isAdministrator])

  const attendanceMembers = useMemo(
    () =>
      attendance?.attendees.map((attendee) => ({
        userId: attendee.user.id,
        name: attendee.user.name,
        reserved: attendee.reserved,
      })) ?? [],
    [attendance]
  )

  const isWaitingForAttendees = attendanceId !== undefined && isAttendanceLoading

  const openForType = (type: NotificationType) => {
    openCreateEventNotificationModal({
      eventId: event.id,
      eventTitle: event.title,
      eventPath,
      attendanceId,
      type,
      hostingGroups,
      eligibleGroupSlugs,
      attendanceMembers,
    })
  }

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
            title="Du kan ikke opprette varslinger for dette arrangementet."
            message="Dette er fordi du ikke er arrangør. Kontakt dotkom dersom du mener dette er en feil."
          />
        )}

        <Box>
          <Title order={3}>Opprett varsling</Title>
          <PermissionTooltip allowed={canEdit} label="Du kan ikke opprette varslinger for dette arrangementet">
            <Group mt="md">
              <Button onClick={() => openForType("EVENT_UPDATE")} disabled={!canEdit || isWaitingForAttendees}>
                Send oppdatering
              </Button>
              <Button
                variant="light"
                onClick={() => openForType("EVENT_REMINDER")}
                disabled={!canEdit || isWaitingForAttendees}
              >
                Send påminnelse
              </Button>
              <Button
                variant="light"
                onClick={() => openForType("EVENT_UPDATE")}
                disabled={!canEdit || isWaitingForAttendees}
              >
                Varsle påmeldte
              </Button>
            </Group>
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
