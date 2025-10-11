import { UserSearch } from "@/app/(internal)/user/components/user-search"
import type { GroupId } from "@dotkomonline/types"
import {
  Box,
  Card,
  Divider,
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

export const GroupMembersPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const { members } = useWorkspaceMembersAllQuery(group.slug)
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()

  const openCreate = useCreateGroupMemberModal({ group })

  const membersList = useMemo(() => {
    if (!members) return []

    // Sorts active members first, then by start date
    return Array.from(members.values()).sort((a, b) => {
      const aIsActive = a.groupMember?.groupMemberships.some((membership) => membership.end === null) ?? false
      const bIsActive = b.groupMember?.groupMemberships.some((membership) => membership.end === null) ?? false

      if (aIsActive !== bIsActive) {
        return aIsActive ? -1 : 1
      }

      const aStart = a.groupMember?.groupMemberships.at(0)?.start
      const bStart = b.groupMember?.groupMemberships.at(0)?.start

      if (!aStart || !bStart) {
        return aStart ? -1 : 1
      }

      return compareDesc(aStart, bStart)
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
        <Text>Hvit - Ok</Text>
        <Text>Rød - Brukeren er i OW-gruppen, men ikke i e-postlisten</Text>
        <Text>Rød - Brukeren er i e-postlisten, men ikke i OW-gruppen</Text>
        <Text>Grå - Brukeren er ikke aktiv medlem</Text>
        <MemberTable table={membersTable} groupSlug={group.slug} />
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
                  row.original.groupMember && !row.original.workspaceMember
                    ? "var(--mantine-color-yellow-light)"
                    : !row.original.groupMember && row.original.workspaceMember
                      ? "var(--mantine-color-red-light)"
                      : row.original.groupMember &&
                          !row.original.groupMember.groupMemberships.some(
                            (membership) =>
                              (groupSlug ? membership.groupId === groupSlug : true) && membership.end === null
                          )
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
