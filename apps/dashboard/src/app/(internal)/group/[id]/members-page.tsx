import { UserSearch } from "@/app/(internal)/user/components/user-search"
import { GenericTable } from "@/components/GenericTable"
import { Box, Divider, Stack, Text, Title } from "@mantine/core"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useCreateGroupMemberModal } from "../modals/create-group-member-modal"
import { useWorkspaceMembersAllQuery } from "../queries"
import { useGroupDetailsContext } from "./provider"
import { useGroupMemberTable } from "./use-group-member-table"

export const GroupMembersPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const { members } = useWorkspaceMembersAllQuery(group.slug)

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

  const membersWithoutWorkspace = membersList.filter(({ workspaceMember }) => !workspaceMember)
  const workspaceWithoutMember = membersList.filter(({ groupMember }) => !groupMember)

  return (
    <Box>
      <Stack>
        <Title order={3} mb={10}>
          Legg til bruker
        </Title>
        <UserSearch onSubmit={(values) => openCreate({ userId: values.id })} excludeUserIds={activeMemberIds} />
        <Divider />
        <Title order={3}>Medlemmer</Title>
        {membersWithoutWorkspace.length === 0 && workspaceWithoutMember.length === 0 && membersList.length !== 0 ? (
          <Text>All good</Text>
        ) : workspaceWithoutMember.map(({ workspaceMember }) => (
          <Text color="orange" key={workspaceMember?.id}>
            Bruker {workspaceMember?.id} finnes i Google Workspace
          </Text>
        ))}
        <GenericTable table={membersTable} />
      </Stack>
    </Box>
  )
}
