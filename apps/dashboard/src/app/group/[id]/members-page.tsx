import { UserSearch } from "@/app/user/components/UserSearch/UserSearch"
import { GenericTable } from "@/components/GenericTable"
import { Box, Divider, Stack, Title } from "@mantine/core"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useCreateGroupMemberModal } from "../modals/create-group-member-modal"
import { useGroupMembersAllQuery } from "../queries"
import { useGroupDetailsContext } from "./provider"
import { useGroupMemberTable } from "./use-group-member-table"

export const GroupMembersPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const { members } = useGroupMembersAllQuery(group.slug)

  const openCreate = useCreateGroupMemberModal({ group })

  const membersList = useMemo(() => {
    if (!members) return []

    // Sorts active members first, then by start date
    return Array.from(members.values()).sort((a, b) => {
      const aIsActive = a.groupMemberships.some((membership) => membership.end === null)
      const bIsActive = b.groupMemberships.some((membership) => membership.end === null)

      if (aIsActive !== bIsActive) {
        return aIsActive ? -1 : 1
      }

      const aStart = a.groupMemberships.at(0)?.start
      const bStart = b.groupMemberships.at(0)?.start

      if (!aStart || !bStart) {
        return aStart ? -1 : 1
      }

      return compareDesc(aStart, bStart)
    })
  }, [members])

  const membersTable = useGroupMemberTable({ data: membersList, groupId: group.slug })

  return (
    <Box>
      <Stack>
        <Title order={3} mb={10}>
          Legg til bruker
        </Title>
        <UserSearch
          onSubmit={(values) => openCreate({ userId: values.id })}
          excludeUserIds={membersList.map((member) => member.id)}
        />
        <Divider />
        <Title order={3}>Medlemmer</Title>
        <GenericTable table={membersTable} />
      </Stack>
    </Box>
  )
}
