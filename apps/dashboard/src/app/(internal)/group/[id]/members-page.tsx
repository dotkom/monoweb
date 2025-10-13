import { UserSearch } from "@/app/(internal)/user/components/user-search"
import {
  type GroupId,
  type GroupMember,
  type WorkspaceMemberSyncAction,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import {
  Box,
  Card,
  Divider,
  Group,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core"
import { flexRender } from "@tanstack/react-table"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useLinkOwUserToWorkspaceUserMutation } from "../../user/mutations"
import { useCreateGroupMemberModal } from "../modals/create-group-member-modal"
import { useWorkspaceMembersAllQuery } from "../queries"
import { useGroupDetailsContext } from "./provider"
import { useGroupMemberTable } from "./use-group-member-table"

// Lower number means higher priority
const SYNC_ACTION_SORT_PRIORITY: Record<WorkspaceMemberSyncAction, number> = {
  TO_ADD: 1,
  TO_REMOVE: 2,
  NEEDS_LINKING: 3,
  NONE: 4,
}

const sortByStartDate = (a: GroupMember | null, b: GroupMember | null) => {
  if (a === null && b === null) {
    return 0
  }

  // Assumes memberships are sorted by start date descending
  const aStart = a?.groupMemberships.at(0)?.start
  const bStart = b?.groupMemberships.at(0)?.start

  if (!aStart || !bStart) {
    return aStart ? -1 : 1
  }

  return compareDesc(aStart, bStart)
}

export const GroupMembersPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const { members } = useWorkspaceMembersAllQuery(group.slug)
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()

  const openCreate = useCreateGroupMemberModal({ group })

  const membersList = useMemo(() => {
    if (!members) return []

    // Sort by active members first, then by sync action, then by start date
    return Array.from(members.values()).toSorted((a, b) => {
      const aIsActive = getActiveGroupMembership(a.groupMember, group.slug) !== null
      const bIsActive = getActiveGroupMembership(b.groupMember, group.slug) !== null

      if (aIsActive !== bIsActive) {
        return aIsActive ? -1 : 1
      }

      if (a.syncAction === b.syncAction) {
        return sortByStartDate(a.groupMember, b.groupMember)
      }

      return SYNC_ACTION_SORT_PRIORITY[a.syncAction] - SYNC_ACTION_SORT_PRIORITY[b.syncAction]
    })
  }, [members])

  const membersTable = useGroupMemberTable({ data: membersList, groupId: group.slug })

  const activeMemberIds = useMemo(() => {
    return membersList.map(({ groupMember }) => groupMember?.id).filter((id): id is string => Boolean(id))
  }, [membersList])

  return (
    <Box>
      <Stack>
        <Title order={3} mb={10}>
          Legg til bruker
        </Title>
        <UserSearch onSubmit={(values) => openCreate({ userId: values.id })} excludeUserIds={activeMemberIds} />
        <Divider />
        <Title order={3}>Medlemmer</Title>
        <MemberTable table={membersTable} groupSlug={group.slug} />
        <Stack gap={0}>
          <Group gap="xs">
            <Box
              h={16}
              w={16}
              bg="var(--mantine-color-white)"
              bd="1px solid var(--mantine-color-gray-outline)"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
            <Text>Hvit - All good</Text>
          </Group>
          <Group gap="xs">
            <Box
              h={16}
              w={16}
              bg="var(--mantine-color-gray-light)"
              bd="1px solid var(--mantine-color-gray-outline)"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
            <Text>Grå - Brukeren er ikke aktiv medlem</Text>
          </Group>
          <Group gap="xs">
            <Box
              h={16}
              w={16}
              bg="var(--mantine-color-red-light)"
              bd="1px solid var(--mantine-color-gray-outline)"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
            <Text>Rød - Brukeren er i OW-gruppen, men ikke i e-postlisten</Text>
          </Group>
          <Group gap="xs">
            <Box
              h={16}
              w={16}
              bg="var(--mantine-color-yellow-light)"
              bd="1px solid var(--mantine-color-gray-outline)"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
            <Text>Gul - Brukeren er i e-postlisten, men ikke i OW-gruppen</Text>
          </Group>
        </Stack>
      </Stack>
    </Box>
  )
}

const MemberTable = ({ table, groupSlug }: { table: ReturnType<typeof useGroupMemberTable>; groupSlug?: GroupId }) => {
  return (
    <Card withBorder p="xs">
      <Table.ScrollContainer minWidth={600} maxHeight={400} type="native">
        <Table stickyHeader>
          <TableThead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableTr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableTh
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      backgroundColor: "var(--mantine-color-default)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  </TableTh>
                ))}
              </TableTr>
            ))}
          </TableThead>
          <TableTbody>
            {table.getRowModel().rows.length === 0 && (
              <TableTr>
                <TableTd colSpan={table.getAllColumns().length} align="center">
                  <Text>Ingen data</Text>
                </TableTd>
              </TableTr>
            )}
            {table.getRowModel().rows.map((row) => (
              <TableTr
                key={row.id}
                bg={
                  row.original.syncAction === "TO_ADD" || row.original.syncAction === "TO_REMOVE"
                    ? "var(--mantine-color-red-light)"
                    : row.original.syncAction === "NEEDS_LINKING"
                      ? "var(--mantine-color-yellow-light)"
                      : row.original.groupMember && !getActiveGroupMembership(row.original.groupMember, groupSlug)
                        ? "var(--mantine-color-gray-light)"
                        : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                ))}
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  )
}
