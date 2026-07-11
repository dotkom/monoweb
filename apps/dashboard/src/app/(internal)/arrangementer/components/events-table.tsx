import { DateTooltip } from "@/components/DateTooltip"
import { GenericTable } from "@/components/GenericTable"
import { TableCellLink } from "@/components/TableCellLink"
import { useCanEditByGroups } from "@/hooks/use-can-edit-by-groups"
import {
  EventStatusSchema,
  type EventWithAttendance,
  mapEventStatusToLabel,
  mapEventTypeToLabel,
} from "@dotkomonline/rpc/event"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { EventHostingGroupList } from "./event-hosting-group-list"
import { Box, Center, Group, Pill, Tooltip } from "@mantine/core"
import { IconEye, IconEyeDotted } from "@tabler/icons-react"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { useAuthorization } from "@/auth/authorization-context"

export type EventTableRow = EventWithAttendance & {
  canEdit: boolean
}

interface Props {
  events: EventWithAttendance[]
  onLoadMore?(): void
  dimReadOnlyRows?: boolean
}

export const EventTable = ({ events, onLoadMore, dimReadOnlyRows = false }: Props) => {
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

                return <EditableRowIndicator canEdit={canEdit} />
              },
            })
          : null,
        columnHelper.accessor(({ event }) => event, {
          id: "title",
          // The margin matches the padding of <TableCellLink>
          header: () => <span style={{ marginLeft: "var(--mantine-spacing-xs)" }}>Arrangement</span>,
          meta: {
            smallPadding: true,
          },
          cell: (info) => {
            const status = info.getValue().status
            const isDraft = status === EventStatusSchema.enum.DRAFT

            return (
              <TableCellLink href={`/arrangementer/${info.getValue().id}`} size="sm">
                <Group>
                  {info.getValue().title}
                  {isDraft && (
                    <Pill
                      size="xs"
                      bg="var(--mantine-color-orange-light)"
                      c="var(--mantine-color-orange-light-color)"
                      styles={{
                        label: {
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          paddingRight: "1px",
                          letterSpacing: "0.025em",
                        },
                      }}
                    >
                      <IconEyeDotted size={14} />
                      {mapEventStatusToLabel(status)}
                    </Pill>
                  )}
                </Group>
              </TableCellLink>
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
    <GenericTable
      table={table}
      onLoadMore={onLoadMore}
      getRowStyle={(row) => ({
        opacity: dimReadOnlyRows && !row.original.canEdit ? 0.65 : 1,
      })}
      getCellStyle={(_row, columnIndex) => {
        if (columnIndex === 0) {
          return {
            paddingRight: 0,
            paddingLeft: "10px",
          }
        }

        return undefined
      }}
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
      <Tooltip label={editableLabel}>
        <Center w="14px">
          <Box
            w="4px"
            h="20px"
            style={{
              borderRadius: "var(--mantine-radius-xl)",
              backgroundColor: "var(--mantine-color-blue-4)",
            }}
          />
        </Center>
      </Tooltip>
    )
  }

  return (
    <PermissionTooltip allowed={false} label={readOnlyLabel}>
      <Center>
        <IconEye size={14} color="var(--mantine-color-dimmed)" />
      </Center>
    </PermissionTooltip>
  )
}
