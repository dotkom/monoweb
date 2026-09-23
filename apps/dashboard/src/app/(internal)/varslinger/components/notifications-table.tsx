"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { EditableRowIndicator } from "@/components/EditableRowIndicator"
import { useTRPC } from "@/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getNotificationLinkTypeLabel,
  getNotificationTypeLabel,
  type NotificationManagement,
  type NotificationRecipientStats,
} from "@dotkomonline/rpc/notification"
import { Text, TextLink } from "@dotkomonline/ui"
import { useQueries } from "@tanstack/react-query"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

type NotificationTableRow = NotificationManagement & {
  canManage: boolean
}

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
  canManage,
  statsQuery,
  children,
}: {
  canManage: boolean
  statsQuery: { isPending: boolean; data: NotificationRecipientStats | undefined } | undefined
  children: (stats: NotificationRecipientStats) => string | number
}) {
  if (!canManage) {
    return <Text className="text-sm text-muted-foreground">—</Text>
  }

  if (statsQuery === undefined || statsQuery.isPending) {
    return <div className="h-4 w-10 animate-pulse rounded-sm bg-muted" />
  }

  if (statsQuery.data === undefined) {
    return <Text className="text-sm text-muted-foreground">—</Text>
  }

  return children(statsQuery.data)
}

export function NotificationsTable({
  notifications,
  onLoadMore,
  showLinkType = false,
  showReadPercentage = true,
  dimReadOnlyRows = false,
}: {
  notifications: NotificationManagement[]
  onLoadMore?: () => void
  showLinkType?: boolean
  showReadPercentage?: boolean
  dimReadOnlyRows?: boolean
}) {
  const trpc = useTRPC()
  const authorization = useAuthorization()
  const { isAdministrator, canManageNotification } = authorization
  const columnHelper = createColumnHelper<NotificationTableRow>()

  const rows = useMemo(
    (): NotificationTableRow[] =>
      notifications.map((notification) => ({
        ...notification,
        canManage: canManageNotification(notification.actorGroupId),
      })),
    [canManageNotification, notifications]
  )

  const statsQueries = useQueries({
    queries: rows.map((notification) => ({
      ...trpc.notification.getRecipientStats.queryOptions(notification.id),
      enabled: notification.canManage,
      retry: false,
    })),
  })

  const statsByNotificationId = useMemo(() => {
    return new Map(rows.map((notification, index) => [notification.id, statsQueries[index]]))
  }, [rows, statsQueries])

  const columns = useMemo(() => {
    const editableIndicatorColumn =
      isAdministrator === false
        ? columnHelper.accessor("canManage", {
            header: () => null,
            meta: {
              fit: true,
              noPadding: true,
            },
            cell: (info) => (
              <EditableRowIndicator
                canEdit={info.getValue()}
                readOnlyLabel="Du kan se denne varslingen, men ikke redigere den"
                editableLabel="Du kan redigere denne varslingen"
              />
            ),
          })
        : null

    const titleColumn = columnHelper.accessor("title", {
      header: () => "Tittel",
      meta: {
        smallPadding: true,
      },
      cell: (info) => (
        <TextLink href={`/varslinger/${info.row.original.id}`} className="text-sm">
          {info.getValue()}
        </TextLink>
      ),
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
        <RecipientStatsCell
          canManage={info.row.original.canManage}
          statsQuery={statsByNotificationId.get(info.row.original.id)}
        >
          {(stats) => stats.totalCount}
        </RecipientStatsCell>
      ),
    })

    const readPercentageColumn = columnHelper.display({
      id: "readPercentage",
      header: () => "Lest",
      cell: (info) => (
        <RecipientStatsCell
          canManage={info.row.original.canManage}
          statsQuery={statsByNotificationId.get(info.row.original.id)}
        >
          {(stats) => formatReadPercentage(stats)}
        </RecipientStatsCell>
      ),
    })

    return [
      editableIndicatorColumn,
      titleColumn,
      typeColumn,
      actorGroupColumn,
      ...(showLinkType ? [linkTypeColumn] : []),
      createdAtColumn,
      recipientsColumn,
      ...(showReadPercentage ? [readPercentageColumn] : []),
    ].filter((column): column is NonNullable<typeof column> => Boolean(column))
  }, [columnHelper, isAdministrator, showLinkType, showReadPercentage, statsByNotificationId])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <DataTable
      table={table}
      fetchNextPage={onLoadMore}
      hasNextPage={onLoadMore !== undefined}
      getRowClassName={(row) => (dimReadOnlyRows && !row.original.canManage ? "opacity-65" : undefined)}
    />
  )
}
