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
  List,
  ListItem,
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
import { IconAlertTriangleFilled } from "@tabler/icons-react"
import { flexRender } from "@tanstack/react-table"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useLinkOwUserToWorkspaceUserMutation } from "../../user/mutations"
import { useIsAdminQuery } from "../../user/queries"
import { useCreateGroupMemberModal } from "../modals/create-group-member-modal"
import { useGroupMembersAllQuery, useWorkspaceMembersAllQuery } from "../queries"
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
  const { isAdmin } = useIsAdminQuery()
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()

  // We only want to fetch workspace members if the group is linked to a workspace group
  // We don't want to display workspace columns if we do not fetch workspace members
  // And we do not want to color the rows based on sync action if we do not fetch workspace members
  // Hence, we have two calls to fetch members, one with workspace members and one with just group members
  // To make things easier, we then transform the group member list to the same shape as the workspace member list
  const showWorkspaceColumns = !Boolean(group.workspaceGroupId)
  const { members: membersWithWorkspace } = useWorkspaceMembersAllQuery(group.slug, showWorkspaceColumns)
  const { members: membersWithoutWorkspace } = useGroupMembersAllQuery(group.slug, !showWorkspaceColumns)

  // We memoize the transformation since we only need to
  const lol = useMemo(() => {
    if (!membersWithoutWorkspace) return []

    return [...membersWithoutWorkspace.values()].map(
      (groupMember) =>
        ({
          groupMember,
          workspaceMember: null,
          syncAction: "NONE",
        }) as const
    )
  }, [membersWithoutWorkspace])

  const members = showWorkspaceColumns ? membersWithWorkspace : lol

  const openCreate = useCreateGroupMemberModal({ group })

  const membersList = useMemo(() => {
    if (!members) return []

    // Sort by active members first, then by sync action, then by start date
    return members.toSorted((a, b) => {
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
  }, [members, group.slug])

  const membersTable = useGroupMemberTable({
    data: membersList,
    groupId: group.slug,
    isAdmin: isAdmin ?? false,
    showWorkspaceColumns,
  })

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

        <Stack bg="var(--mantine-color-gray-light)" p="sm" style={{ borderRadius: "var(--mantine-radius-md)" }}>
          <Group gap="xs">
            <IconAlertTriangleFilled size={22} color="var(--mantine-color-red-text)" />
            <Title order={4}>Medlemmer og e-postlisten er usynkron</Title>
          </Group>
          <List>
            <ListItem>
              <Text size="sm">Må legges til: 123</Text>
            </ListItem>
            <ListItem>
              <Text size="sm">Må fjernes: 123</Text>
            </ListItem>
            <ListItem>
              <Text size="sm">Mangler bruker (kontakt HS): 123</Text>
            </ListItem>
          </List>
        </Stack>

        <MemberTable table={membersTable} groupSlug={group.slug} enableRowBackgroundColor={showWorkspaceColumns} />
      </Stack>
    </Box>
  )
}

interface MemberTableProps {
  table: ReturnType<typeof useGroupMemberTable>
  groupSlug?: GroupId
  enableRowBackgroundColor?: boolean
}

const MemberTable = ({ table, groupSlug, enableRowBackgroundColor = false }: MemberTableProps) => {
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
            {table.getRowModel().rows.map((row) => {
              const isInactive =
                Boolean(row.original.groupMember) && !getActiveGroupMembership(row.original.groupMember, groupSlug)

              const background = enableRowBackgroundColor
                ? getRowBackground(row.original.syncAction, isInactive)
                : undefined

              return (
                <TableTr key={row.id} bg={background}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  )
}

const getRowBackground = (syncAction: WorkspaceMemberSyncAction, isInactive: boolean) => {
  if (syncAction === "TO_ADD" || syncAction === "TO_REMOVE") {
    return "var(--mantine-color-red-light)"
  }

  if (syncAction === "NEEDS_LINKING") {
    return "var(--mantine-color-yellow-light)"
  }

  if (isInactive) {
    return "var(--mantine-color-gray-light)"
  }

  return undefined
}
