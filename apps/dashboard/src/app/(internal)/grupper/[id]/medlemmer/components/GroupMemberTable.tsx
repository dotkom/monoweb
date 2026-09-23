"use client"

import { FilterableDataTable } from "@/components/FilterableDataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { useUser } from "@auth0/nextjs-auth0/client"
import { type GroupId, type GroupMembership, getActiveGroupMembership } from "@dotkomonline/rpc/group"
import type { WorkspaceMemberLink, WorkspaceMemberSyncState } from "@dotkomonline/rpc/workspace"
import { Text, TextLink, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconAlertTriangleFilled, IconSquareCheckFilled } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, type Row } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  showWorkspaceColumns: boolean
  groupId: GroupId
  data: WorkspaceMemberLink[]
  isLoading?: boolean
  actions?: React.ReactNode
}

function formatRoles(memberships: GroupMembership[]) {
  const latestRoles = memberships.at(0)?.roles.map((role) => role.name)
  return latestRoles?.join(", ") ?? "-"
}

export const GroupMemberTable = ({ data, groupId, showWorkspaceColumns, isLoading, actions }: Props) => {
  const { user: sessionUser } = useUser()
  const userId = sessionUser?.sub ?? null

  const columnHelper = createColumnHelper<WorkspaceMemberLink>()

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor("groupMember.name", {
        header: () => "Navn",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const { groupMember } = info.row.original

          if (!groupMember) {
            return <Text className="text-sm text-muted-foreground">Ingen bruker</Text>
          }

          const isActive = getActiveGroupMembership(groupMember, groupId)

          return (
            <TextLink href={`/brukere/${groupMember.id}`} className={isActive ? undefined : "text-muted-foreground"}>
              <span className="inline-flex items-center gap-1.5">
                <span>{groupMember.name || "<Uten navn>"}</span>
                {userId === groupMember.id && <span className="text-xs text-muted-foreground">(deg)</span>}
              </span>
            </TextLink>
          )
        },
      }),
      showWorkspaceColumns &&
        columnHelper.accessor("workspaceMember.email", {
          header: () => (
            <>
              <span>E-post</span> <span className="text-muted-foreground">(e-postliste)</span>
            </>
          ),
          cell: (info) => {
            const email = info.getValue()

            return (
              <div className="flex flex-col gap-0">
                <SyncStateIndicator
                  syncState={info.row.original.syncState}
                  inMemberList={Boolean(info.row.original.workspaceMember)}
                />
                {email && <Text className="text-xs">{email}</Text>}
              </div>
            )
          },
        }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "roles",
        header: () => "Roller",
        cell: (info) => formatRoles(info.getValue()?.groupMemberships ?? []),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "start",
        header: () => "Startdato",
        sortingFn: "datetime",
        cell: (info) => {
          const date = info.getValue()?.groupMemberships.at(0)?.start
          return date ? <DateTooltip date={date} /> : "-"
        },
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "end",
        header: () => "Sluttdato",
        sortingFn: "datetime",
        cell: (info) => {
          const date = info.getValue()?.groupMemberships.at(0)?.end
          return date ? <DateTooltip date={date} /> : "-"
        },
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "actions",
        header: () => "Detaljer",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => {
          const member = info.getValue()

          if (!member) {
            return <Text className="text-xs">-</Text>
          }

          return <TextLink href={`/grupper/${groupId}/medlemmer/${member.id}`}>Rediger</TextLink>
        },
      }),
    ]

    return cols.filter((col): col is Exclude<typeof col, false> => Boolean(col))
  }, [columnHelper, groupId, showWorkspaceColumns, userId])

  const tableOptions = useMemo(
    () => ({
      data,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [data, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      isLoading={isLoading}
      searchPlaceholder="Søk etter medlemmer..."
      getRowClassName={(row) => getMemberRowClassName(row, groupId, showWorkspaceColumns)}
      actions={actions}
    />
  )
}

function getMemberRowClassName(row: Row<WorkspaceMemberLink>, groupId: GroupId, enableRowBackgroundColor: boolean) {
  if (!enableRowBackgroundColor) {
    return undefined
  }

  const isInactive = Boolean(row.original.groupMember) && !getActiveGroupMembership(row.original.groupMember, groupId)

  return getRowBackgroundClass(row.original.syncState, isInactive)
}

function getRowBackgroundClass(syncState: WorkspaceMemberSyncState, isInactive: boolean) {
  if (syncState === "PENDING_ADD" || syncState === "PENDING_REMOVE") {
    return "bg-red-100 dark:bg-red-950/40"
  }

  if (syncState === "PENDING_LINK") {
    return "bg-yellow-100 dark:bg-yellow-950/40"
  }

  if (isInactive) {
    return "bg-muted/50"
  }

  return undefined
}

const SyncStateIndicator = ({
  syncState,
  inMemberList,
}: {
  syncState: WorkspaceMemberSyncState
  inMemberList: boolean
}) => {
  switch (syncState) {
    case "PENDING_ADD": {
      return (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex w-fit items-center gap-1.5">
              <IconAlertTriangleFilled className="size-3.5 text-red-600" />
              <Text className="text-sm">Må legges til</Text>
            </span>
          </TooltipTrigger>
          <TooltipContent>Brukeren er i gruppen, men ikke i e-postlisten</TooltipContent>
        </Tooltip>
      )
    }

    case "PENDING_REMOVE": {
      return (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex w-fit items-center gap-1.5">
              <IconAlertTriangleFilled className="size-3.5 text-red-600" />
              <Text className="text-sm">Må fjernes</Text>
            </span>
          </TooltipTrigger>
          <TooltipContent>E-posten er i e-postlisten, men det finnes ingen tilknyttet bruker i gruppen</TooltipContent>
        </Tooltip>
      )
    }

    case "PENDING_LINK": {
      return (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex items-center gap-1.5">
              <IconAlertTriangleFilled className="size-3.5 text-yellow-600" />
              <Text className="text-sm">Ingen tilknyttet bruker. Kontakt HS</Text>
            </span>
          </TooltipTrigger>
          <TooltipContent>E-posteadressen er ikke tilknyttet en bruker</TooltipContent>
        </Tooltip>
      )
    }

    case "SYNCED": {
      return (
        <span className="inline-flex items-center gap-1.5">
          <IconSquareCheckFilled className={`size-3.5 ${inMemberList ? "text-green-600" : "text-muted-foreground"}`} />
          {inMemberList ? (
            <Text className="text-sm">Synkronisert</Text>
          ) : (
            <Text className="text-sm text-muted-foreground">Ikke i e-postlisten</Text>
          )}
        </span>
      )
    }
  }
}
