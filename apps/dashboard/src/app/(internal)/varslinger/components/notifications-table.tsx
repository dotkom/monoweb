"use client"

import { DateTooltip } from "@/components/DateTooltip"
import { GenericTable } from "@/components/GenericTable"
import { TableCellLink } from "@/components/TableCellLink"
import { useTRPC } from "@/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getNotificationLinkTypeLabel,
  getNotificationTypeLabel,
  type NotificationManagement,
  type NotificationRecipientStats,
} from "@dotkomonline/rpc/notification"
import { Skeleton, Text } from "@mantine/core"
import { useQueries } from "@tanstack/react-query"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

function getActorGroupLabel(notification: NotificationManagement): string {
  if (notification.actorGroup === null) {
    return "System"
  }

  return getGroupDisplayName(notification.actorGroup)
}

function formatReadPercentage(stats: NotificationRecipientStats): string {
  if (stats.totalCount === 0) {
    return "—"
  }

  return `${Math.round((stats.readCount / stats.totalCount) * 100)}%`
}

function RecipientStatsCell({
  statsQuery,
  children,
}: {
  statsQuery: { isPending: boolean; data: NotificationRecipientStats | undefined } | undefined
  children: (stats: NotificationRecipientStats) => string | number
}) {
  if (statsQuery === undefined || statsQuery.isPending) {
    return <Skeleton height={16} width={40} />
  }

  if (statsQuery.data === undefined) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    )
  }

  return children(statsQuery.data)
}

export function NotificationsTable({
  notifications,
  onLoadMore,
  showLinkType = false,
  showReadPercentage = true,
}: {
  notifications: NotificationManagement[]
  onLoadMore?: () => void
  showLinkType?: boolean
  showReadPercentage?: boolean
}) {
  const trpc = useTRPC()
  const columnHelper = createColumnHelper<NotificationManagement>()

  const statsQueries = useQueries({
    queries: notifications.map((notification) => ({
      ...trpc.notification.getRecipientStats.queryOptions(notification.id),
      retry: false,
    })),
  })

  const statsByNotificationId = useMemo(() => {
    return new Map(notifications.map((notification, index) => [notification.id, statsQueries[index]]))
  }, [notifications, statsQueries])

  const columns = useMemo(() => {
    const titleColumn = columnHelper.accessor("title", {
      header: () => "Tittel",
      meta: {
        smallPadding: true,
      },
      cell: (info) => <TableCellLink href={`/varslinger/${info.row.original.id}`}>{info.getValue()}</TableCellLink>,
    })

    const typeColumn = columnHelper.accessor("type", {
      header: () => "Type",
      cell: (info) => getNotificationTypeLabel(info.getValue()),
    })

    const actorGroupColumn = columnHelper.accessor((notification) => getActorGroupLabel(notification), {
      id: "actorGroup",
      header: () => "Sendt av",
      cell: (info) => info.getValue(),
    })

    const linkTypeColumn = columnHelper.accessor(
      (notification) => getNotificationLinkTypeLabel(notification.link.type),
      {
        id: "linkType",
        header: () => "Lenke",
        cell: (info) => info.getValue(),
      }
    )

    const createdAtColumn = columnHelper.accessor("createdAt", {
      header: () => "Sendt",
      cell: (info) => <DateTooltip date={info.getValue()} />,
    })

    const recipientsColumn = columnHelper.display({
      id: "recipients",
      header: () => "Mottakere",
      cell: (info) => (
        <RecipientStatsCell statsQuery={statsByNotificationId.get(info.row.original.id)}>
          {(stats) => stats.totalCount}
        </RecipientStatsCell>
      ),
    })

    const readPercentageColumn = columnHelper.display({
      id: "readPercentage",
      header: () => "Lest",
      cell: (info) => (
        <RecipientStatsCell statsQuery={statsByNotificationId.get(info.row.original.id)}>
          {(stats) => formatReadPercentage(stats)}
        </RecipientStatsCell>
      ),
    })

    return [
      titleColumn,
      typeColumn,
      actorGroupColumn,
      ...(showLinkType ? [linkTypeColumn] : []),
      createdAtColumn,
      recipientsColumn,
      ...(showReadPercentage ? [readPercentageColumn] : []),
    ]
  }, [columnHelper, showLinkType, showReadPercentage, statsByNotificationId])

  const table = useReactTable({
    data: notifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <GenericTable table={table} onLoadMore={onLoadMore} />
}
