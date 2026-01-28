import { AllGroupsTable } from "@/app/(internal)/grupper/all-groups-table"
import { Skeleton, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { useGroupAllByMemberQuery } from "../queries"
import { useUserDetailsContext } from "./provider"

export const UserGroupPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { groups, isLoading } = useGroupAllByMemberQuery(user.id)

  return (
    <Stack>
      <Title order={2}>Grupper</Title>
      <Skeleton visible={isLoading}>
        <AllGroupsTable groups={groups} />
      </Skeleton>
    </Stack>
  )
}
