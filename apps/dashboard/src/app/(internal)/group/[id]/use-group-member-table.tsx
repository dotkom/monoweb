"use client"

import { useSession } from "@dotkomonline/oauth2/react"
import {
  type GroupId,
  type GroupMember,
  type GroupMembership,
  type WorkspaceMember,
  type WorkspaceMemberSyncAction,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import { Anchor, Group, Stack, Text } from "@mantine/core"
import { IconAlertTriangleFilled, IconSquareCheckFilled } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  showWorkspaceColumns: boolean
  isAdmin: boolean
  groupId: GroupId
  data: {
    groupMember: GroupMember | null
    workspaceMember: WorkspaceMember | null
    syncAction: WorkspaceMemberSyncAction
  }[]
}

function formatRoles(memberships: GroupMembership[]) {
  const latestRoles = memberships.at(0)?.roles.map((role) => role.name)
  return latestRoles?.join(", ") ?? "-"
}

function formatMembershipDate(date: Date | undefined | null) {
  return date ? formatDate(date, "dd.MM.yyyy") : "-"
}

export const useGroupMemberTable = ({ data, groupId, isAdmin, showWorkspaceColumns }: Props) => {
  const userId = useSession()?.sub ?? null
  
  const columnHelper = createColumnHelper<{
    groupMember: GroupMember | null
    workspaceMember: WorkspaceMember | null
    syncAction: WorkspaceMemberSyncAction
  }>()

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor("groupMember.name", {
        header: () => "Navn",
        cell: (info) => {
          const { groupMember } = info.row.original

          if (!groupMember) {
            return (
              <Text size="sm" c="dimmed">
                Ingen bruker
              </Text>
            )
          }

          return (
            <Anchor
              c={getActiveGroupMembership(groupMember, groupId) ? undefined : "var(--mantine-color-text)"}
              component={Link}
              href={`/user/${groupMember.id}`}
            >
              <Group gap={6}>
                <Text size="sm">{groupMember.name || "<Uten navn>"}</Text>
                {userId === groupMember.id && (
                  <Text size="xs" c="var(--mantine-color-dimmed)" span>
                    (deg)
                  </Text>
                )}
              </Group>
            </Anchor>
          )
        },
      }),
      showWorkspaceColumns &&
        columnHelper.accessor("workspaceMember.email", {
          header: () => (
            <>
              <span>E-post</span> <span style={{ color: "var(--mantine-color-dimmed)" }}>(e-postliste)</span>
            </>
          ),
          cell: (info) => {
            const email = info.getValue()

            return (
              <Stack gap={0}>
                <SyncActionStatusText
                  syncAction={info.row.original.syncAction}
                  inMemberList={Boolean(info.row.original.workspaceMember)}
                />
                {email && <Text size="xs">{email}</Text>}
              </Stack>
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
        cell: (info) => formatMembershipDate(info.getValue()?.groupMemberships.at(0)?.start),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => formatMembershipDate(info.getValue()?.groupMemberships.at(0)?.end),
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => {
          const member = info.getValue()

          if (!member) {
            return <Text size="xs">-</Text>
          }

          return (
            <Anchor component={Link} size="sm" href={`/group/${groupId}/${member.id}`}>
              Rediger
            </Anchor>
          )
        },
      }),
    ]

    return cols.filter((col): col is Exclude<typeof col, false> => Boolean(col))
  }, [columnHelper, groupId, isAdmin, showWorkspaceColumns])

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}

const SyncActionStatusText = ({
  syncAction,
  inMemberList,
}: { syncAction: WorkspaceMemberSyncAction; inMemberList: boolean }) => {
  switch (syncAction) {
    case "TO_ADD": {
      return (
        <Group gap={6}>
          <IconAlertTriangleFilled size={14} color="var(--mantine-color-red-text)" />
          <Text size="sm">Må legges til</Text>
        </Group>
      )
    }

    case "TO_REMOVE": {
      return (
        <Group gap={6}>
          <IconAlertTriangleFilled size={14} color="var(--mantine-color-red-text)" />
          <Text size="sm">Må fjernes</Text>
        </Group>
      )
    }

    case "NEEDS_LINKING": {
      return (
        <Group gap={6}>
          <IconAlertTriangleFilled size={14} color="var(--mantine-color-yellow-text)" />
          <Text size="sm">Ingen bruker. Kontakt HS</Text>
        </Group>
      )
    }

    case "NONE": {
      return (
        <Group gap={6}>
          <IconSquareCheckFilled
            size={14}
            color={inMemberList ? "var(--mantine-color-green-text)" : "var(--mantine-color-dimmed)"}
          />
          {inMemberList ? (
            <Text size="sm">Synkronisert</Text>
          ) : (
            <Text size="sm" c="dimmed">
              Ikke i e-postlisten
            </Text>
          )}
        </Group>
      )
    }
  }
}
