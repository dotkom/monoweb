"use client"

import { useAuthorization } from "@/auth/authorization-context"
import {
  EventStatusSchema,
  type EventWithAttendance,
  mapEventStatusToLabel,
  mapEventTypeToLabel,
} from "@dotkomonline/rpc/event"
import { Badge, TextLink, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconEye, IconEyeDotted } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { useCanEditByGroups } from "@/hooks/use-can-edit-by-groups"
import { EventHostingGroupList } from "./EventHostingGroupList"

export type EventTableRow = EventWithAttendance & {
  canEdit: boolean
}

interface Props {
  events: EventWithAttendance[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  dimReadOnlyRows?: boolean
}

export const EventTable = ({
  events,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  dimReadOnlyRows = false,
}: Props) => {
  const authorization = useAuthorization()
  const { isAdministrator } = authorization
  const canEditByGroups = useCanEditByGroups()

  const rows = useMemo(
    (): EventTableRow[] =>
      events.map((eventWithAttendance) => ({
        ...eventWithAttendance,
        canEdit: canEditByGroups(eventWithAttendance.event.hostingGroups.map((group) => group.slug)),
      })),
    [canEditByGroups, events]
  )

  const columnHelper = createColumnHelper<EventTableRow>()
  const columns = useMemo(
    () =>
      [
        isAdministrator === false
          ? columnHelper.accessor("canEdit", {
              header: () => null,
              meta: {
                fit: true,
                noPadding: true,
              },
              cell: (info) => {
                const canEdit = info.getValue()

                return (
                  <EditableRowIndicator
                    canEdit={canEdit}
                    readOnlyLabel="Du kan se dette arrangementet, men ikke redigere det"
                    editableLabel="Du kan redigere dette arrangementet"
                  />
                )
              },
            })
          : null,
        columnHelper.accessor(({ event }) => event, {
          id: "title",
          header: () => <span className="ml-1">Arrangement</span>,
          meta: {
            smallPadding: true,
          },
          cell: (info) => {
            const event = info.getValue()
            const isDraft = event.status === EventStatusSchema.enum.DRAFT

            return (
              <TextLink href={`/arrangementer/${event.id}`} className="text-sm">
                <span className="block w-full rounded-sm px-1 py-1 text-sm no-underline transition-colors duration-75 hover:bg-blue-500/10">
                  {event.title}
                  {isDraft && (
                    <Badge color="orange" variant="secondary" className="inline-flex items-center gap-1 text-xs">
                      <IconEyeDotted size={14} />
                      {mapEventStatusToLabel(event.status)}
                    </Badge>
                  )}
                </span>
              </TextLink>
            )
          },
        }),
        columnHelper.accessor("event.start", {
          header: () => "Startdato",
          cell: (info) => <DateTooltip date={info.getValue()} />,
        }),
        columnHelper.accessor(({ event }) => event, {
          id: "organizers",
          header: () => "Arrangører",
          cell: (info) => (
            <EventHostingGroupList groups={info.getValue().hostingGroups} companies={info.getValue().companies} />
          ),
        }),
        columnHelper.accessor("event.type", {
          header: () => "Type",
          cell: (info) => mapEventTypeToLabel(info.getValue()),
        }),
      ].filter((column): column is NonNullable<typeof column> => Boolean(column)),
    [columnHelper, isAdministrator]
  )

  const table = useReactTable({
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      getRowClassName={(row) => (dimReadOnlyRows && !row.original.canEdit ? "opacity-65" : undefined)}
    />
  )
}

interface EditableRowIndicatorProps {
  canEdit: boolean
  readOnlyLabel?: string
  editableLabel?: string
}

function EditableRowIndicator({
  canEdit,
  readOnlyLabel = "Du kan se dette arrangementet, men ikke redigere det",
  editableLabel = "Du kan redigere dette arrangementet",
}: EditableRowIndicatorProps) {
  if (canEdit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-3.5 justify-center">
            <div className="h-5 w-1 rounded-full bg-blue-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{editableLabel}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <PermissionTooltip allowed={false} label={readOnlyLabel}>
      <div className="flex justify-center">
        <IconEye size={14} className="text-muted-foreground" />
      </div>
    </PermissionTooltip>
  )
}
