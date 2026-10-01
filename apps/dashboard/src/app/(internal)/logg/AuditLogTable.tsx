"use client"

import { DateTooltip } from "@/components/DateTooltip"
import type { AuditActivity, AuditLog } from "@dotkomonline/rpc/audit-log"
import { DataTable, Badge, Button, Text, TextLink, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconChevronDown, IconChevronRight, IconCornerDownRight, IconEye, IconEyeOff } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import { AuditLogModal } from "./AuditLogModal"

type AuditTableRow =
  | {
      kind: "parent"
      activity: AuditActivity
    }
  | {
      kind: "child"
      log: AuditLog
    }

interface Props {
  auditActivities: AuditActivity[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const AuditLogTable = ({
  auditActivities,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const [expandedActivityIds, setExpandedActivityIds] = useState<ReadonlySet<string>>(() => new Set())
  const [hideIds, setHideIds] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null)

  const toggleExpanded = useCallback((activityId: string) => {
    setExpandedActivityIds((current) => {
      const next = new Set(current)

      if (next.has(activityId)) {
        next.delete(activityId)
      } else {
        next.add(activityId)
      }

      return next
    })
  }, [])

  const rows = useMemo(
    () => flattenAuditActivities(auditActivities, expandedActivityIds),
    [auditActivities, expandedActivityIds]
  )

  const columnHelper = createColumnHelper<AuditTableRow>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "chevron",
        header: () => <div className="size-4" aria-hidden />,
        meta: {
          fit: true,
        },
        cell: (info) => {
          const row = info.row.original

          if (row.kind === "child") {
            return <IconCornerDownRight className="size-4 text-muted-foreground/60" />
          }

          if (!canExpandActivity(row.activity)) {
            return null
          }

          const isExpanded = isExpandedActivity(row.activity, expandedActivityIds)
          const Icon = isExpanded ? IconChevronDown : IconChevronRight

          return <Icon className="size-4 text-muted-foreground" />
        },
      }),
      columnHelper.accessor((row) => (row.kind === "parent" ? row.activity.user : null), {
        id: "user",
        header: () => "Bruker",
        cell: (info) => {
          const row = info.row.original
          if (row.kind === "child") {
            return null
          }

          const user = info.getValue()
          if (user !== null) {
            return (
              <TextLink href={`/brukere/${user.id}`} onClick={(event) => event.stopPropagation()}>
                {user.name}
              </TextLink>
            )
          }

          return (
            <Text size="sm" className="text-muted-foreground">
              System
            </Text>
          )
        },
      }),
      columnHelper.accessor((row) => (row.kind === "parent" ? row.activity.createdAt : null), {
        id: "createdAt",
        header: () => "Tidspunkt",
        cell: (info) => {
          const date = info.getValue()
          if (date === null) {
            return null
          }

          return <DateTooltip date={date} />
        },
      }),
      columnHelper.display({
        id: "type",
        header: () => "Type",
        cell: (info) => {
          const row = info.row.original

          if (row.kind === "child") {
            return (
              <Badge variant="outline" className="font-mono text-xs">
                {row.log.tableName}
              </Badge>
            )
          }

          if (canExpandActivity(row.activity)) {
            return (
              <Badge variant="secondary" className="text-xs">
                {row.activity.logs.length} endringer
              </Badge>
            )
          }

          const tableName = row.activity.logs.at(0)?.tableName
          if (tableName === undefined) {
            return null
          }

          return (
            <Badge variant="outline" className="font-mono text-xs">
              {tableName}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "handling",
        header: () => {
          const Icon = hideIds ? IconEyeOff : IconEye
          const tip = hideIds ? "Vis ID-er i handling" : "Skjul ID-er i handling"

          return (
            <div className="flex flex-row gap-1.5 items-center">
              <span>Handling</span>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant="unstyled"
                    className="group"
                    aria-pressed={hideIds}
                    aria-label={tip}
                    onClick={(event) => {
                      setHideIds((prev) => !prev)
                      event.stopPropagation()
                    }}
                  >
                    <Icon className="size-4 text-muted-foreground group-hover:text-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                  arrowClassName="dark:bg-stone-800"
                >
                  {tip}
                </TooltipContent>
              </Tooltip>
            </div>
          )
        },
        meta: {
          wrap: true,
        },
        cell: (info) => {
          const row = info.row.original

          if (row.kind === "child") {
            return <span className="text-muted-foreground">{row.log.operation}</span>
          }

          const label = getParentActionLabel(row.activity, hideIds)

          return (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <span className="max-w-2xl line-clamp-2 wrap-break-word">{label}</span>
              </TooltipTrigger>
              <TooltipContent
                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                arrowClassName="dark:bg-stone-800"
              >
                {getParentActionLabel(row.activity, hideIds)}
              </TooltipContent>
            </Tooltip>
          )
        },
      }),
    ],
    [columnHelper, expandedActivityIds, hideIds]
  )

  const table = useReactTable({
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => (row.kind === "parent" ? `activity-${row.activity.id}` : `log-${row.log.id}`),
    columns,
  })

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        onRowClick={(row) => {
          const tableRow = row.original

          if (tableRow.kind === "child") {
            setSelectedAuditLog(tableRow.log)
            setIsModalOpen(true)
            return
          }

          if (canExpandActivity(tableRow.activity)) {
            toggleExpanded(tableRow.activity.id)
            return
          }

          const log = tableRow.activity.logs.at(0)
          if (log !== undefined) {
            setSelectedAuditLog(log)
            setIsModalOpen(true)
          }
        }}
        getRowClassName={(row) => {
          const expandedGroupClassname = "bg-muted/80 dark:bg-muted/40"

          const childClassName = row.original.kind === "child" ? expandedGroupClassname : undefined

          const activityIsExpanded =
            row.original.kind === "parent" && isExpandedActivity(row.original.activity, expandedActivityIds)
          const expandedParentClassName = activityIsExpanded ? expandedGroupClassname : undefined

          return [childClassName, expandedParentClassName].filter(Boolean).join(" ")
        }}
      />
      <AuditLogModal
        auditLog={selectedAuditLog}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onOpenChangeComplete={(nextOpen) => {
          if (nextOpen) {
            return
          }
          setSelectedAuditLog(null)
        }}
      />
    </>
  )
}

function canExpandActivity(activity: AuditActivity) {
  return activity.logs.length > 1
}

function isExpandedActivity(activity: AuditActivity, expandedActivityIds: ReadonlySet<string>) {
  return expandedActivityIds.has(activity.id)
}

function flattenAuditActivities(
  auditActivities: AuditActivity[],
  expandedActivityIds: ReadonlySet<string>
): AuditTableRow[] {
  const rows: AuditTableRow[] = []

  for (const activity of auditActivities) {
    rows.push({ kind: "parent", activity })

    if (!canExpandActivity(activity) || !isExpandedActivity(activity, expandedActivityIds)) {
      continue
    }

    const logs = activity.logs.toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    for (const log of logs) {
      rows.push({ kind: "child", log })
    }
  }

  return rows
}

function getParentActionLabel(activity: AuditActivity, hideIds: boolean) {
  if (activity.name !== null) {
    return hideIds ? stripIds(activity.name) : activity.name
  }

  const log = activity.logs.at(0)
  if (log !== undefined) {
    return `${log.operation} ${log.tableName}`
  }

  return activity.procedure ?? "Ukjent handling"
}

// Removes IDs and slugs from input.
// Example:
// User(ID=…,Name=Ola Nordmann) in Group(Slug=dotkom,Name=Drifts-…)
//    => User(Name=Ola Nordmann) in Group(Name=Drifts-…)
function stripIds(name: string) {
  return name
    .replace(/\b(?:ID=[a-f0-9-]{8,}|Slug=[a-z0-9-]{3,}),?\s*/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/,\s*\)/g, ")")
    .replace(/\s+/g, " ")
    .trim()
}
