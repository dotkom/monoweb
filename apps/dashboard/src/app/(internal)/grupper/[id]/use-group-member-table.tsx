"use client"

import { DateTooltip } from "@/components/DateTooltip"
import { useSession } from "@dotkomonline/oauth2/react"
import {
  type GroupId,
  type GroupMembership,
  type WorkspaceMemberLink,
  type WorkspaceMemberSyncState,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import { Anchor, Group, Stack, Text, Tooltip } from "@mantine/core"
import { IconAlertTriangleFilled, IconSquareCheckFilled } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  showWorkspaceColumns: boolean
  groupId: GroupId
  data: WorkspaceMemberLink[]
}

function formatRoles(memberships: GroupMembership[]) {
  const latestRoles = memberships.at(0)?.roles.map((role) => role.name)
  return latestRoles?.join(", ") ?? "-"
}

export const useGroupMemberTable = ({ data, groupId, showWorkspaceColumns }: Props) => {
  const userId = useSession()?.sub ?? null

  const columnHelper = createColumnHelper<WorkspaceMemberLink>()

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
              href={`/brukere/${groupMember.id}`}
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
                <SyncStateIndicator
                  syncState={info.row.original.syncState}
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
        cell: (info) => {
          const date = info.getValue()?.groupMemberships.at(0)?.start
          return date ? <DateTooltip date={date} /> : "-"
        },
      }),
      columnHelper.accessor(({ groupMember }) => groupMember, {
        id: "end",
        header: () => "Sluttdato",
        cell: (info) => {
          const date = info.getValue()?.groupMemberships.at(0)?.end
          return date ? <DateTooltip date={date} /> : "-"
        },
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
            <Anchor component={Link} size="sm" href={`/grupper/${groupId}/${member.id}`}>
              Rediger
            </Anchor>
          )
        },
      }),
    ]

    return cols.filter((col): col is Exclude<typeof col, false> => Boolean(col))
  }, [columnHelper, groupId, showWorkspaceColumns, userId])

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
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
        <Tooltip label="Brukeren er i gruppen, men ikke i e-postlisten">
          <Group gap={6} w="fit-content">
            <IconAlertTriangleFilled size={14} color="var(--mantine-color-red-text)" />
            <Text size="sm">Må legges til</Text>
          </Group>
        </Tooltip>
      )
    }

    case "PENDING_REMOVE": {
      return (
        <Tooltip label="E-posten er i e-postlisten, men det finnes ingen tilknyttet bruker i gruppen">
          <Group gap={6} w="fit-content">
            <IconAlertTriangleFilled size={14} color="var(--mantine-color-red-text)" />
            <Text size="sm">Må fjernes</Text>
          </Group>
        </Tooltip>
      )
    }

    case "PENDING_LINK": {
      return (
        <Tooltip label="E-posteadressen er ikke tilknyttet en bruker">
          <Group gap={6}>
            <IconAlertTriangleFilled size={14} color="var(--mantine-color-yellow-text)" />
            <Text size="sm">Ingen tilknyttet bruker. Kontakt HS</Text>
          </Group>
        </Tooltip>
      )
    }

    case "SYNCED": {
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
