"use client"

import {
  type GroupId,
  type GroupMember,
  type GroupMembership,
  type WorkspaceMember,
  type WorkspaceMemberSyncAction,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import { Anchor, Button, Group, Stack, Text } from "@mantine/core"
import { IconCheck, IconSquareCheckFilled, IconSquareXFilled, IconX } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  groupId: GroupId
  data: {
    groupMember: GroupMember | null
    workspaceMember: WorkspaceMember | null
    syncAction: WorkspaceMemberSyncAction
  }[]
}

function formatRoles(memberships: GroupMembership[]) {
  const latestRoles = memberships.at(0)?.roles.map((role) => role.name)
  return latestRoles?.join(", ")
}

function formatMembershipDate(date: Date | undefined | null) {
  return date ? formatDate(date, "dd.MM.yyyy") : "-"
}

export const useGroupMemberTable = ({ data, groupId }: Props) => {
  const columnHelper = createColumnHelper<{
    groupMember: GroupMember | null
    workspaceMember: WorkspaceMember | null
    syncAction: WorkspaceMemberSyncAction
  }>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("groupMember.name", {
        header: () => "Navn",
        cell: (info) => {
          const { groupMember } = info.row.original

          if (!groupMember) {
            return (
              <Text size="xs" c="dimmed">
                Ikke i OW-gruppen
              </Text>
            )
          }

          return (
            <Anchor
              c={getActiveGroupMembership(groupMember, groupId) ? undefined : "var(--mantine-color-text)"}
              component={Link}
              href={`/user/${groupMember.id}`}
            >
              <Group gap="xs" w="fit-content">
                <Text>{groupMember.name || "<Uten navn>"}</Text>
                {groupMember.workspaceUserId ? (
                  <IconCheck size={16} color="green" title="Linket til Google Workspace-bruker" />
                ) : (
                  <IconX size={16} color="red" title="Ikke linket til Google Workspace-bruker" />
                )}
              </Group>
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("workspaceMember.email", {
        header: () => "E-postliste",
        cell: (info) => {
          const { groupMember, workspaceMember, syncAction } = info.row.original

          switch (syncAction) {
            case "TO_ADD": {
              const disabled = !groupMember?.workspaceUserId
              return (
                <Stack gap={4}>
                  <Group gap={4}>
                    <IconSquareXFilled size="0.75rem" color="red" />
                    <Text size="xs">Ikke i e-postlisten</Text>
                  </Group>
                  <Group gap="xs">
                    <Button size="compact-xs" w="fit-content" disabled={disabled}>
                      Legg til i e-postliste
                    </Button>
                    {disabled && (
                      <Text size="xs" c="red">
                        Bruker ikke linket til Google Workspace
                      </Text>
                    )}
                  </Group>
                </Stack>
              )
            }

            case "TO_REMOVE": {
              return (
                <Stack gap={4}>
                  <Group gap={4}>
                    <IconSquareXFilled size="0.75rem" color="red" />
                    <Text size="xs">{workspaceMember?.email ?? "<Ingen e-post>"}</Text>
                  </Group>
                  <Group gap="xs">
                    <Button color="green" size="compact-xs" w="fit-content">
                      Fjern fra e-postliste
                    </Button>
                  </Group>
                </Stack>
              )
            }

            case "NEEDS_LINKING": {
              return <Text size="xs">Trenger linking</Text>
            }

            case "NONE": {
              return (
                <Group gap={4}>
                  <IconSquareCheckFilled size="0.75rem" color="green" />
                  <Text size="xs">All good</Text>
                </Group>
              )
            }
          }
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
    ],
    [columnHelper, groupId]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
