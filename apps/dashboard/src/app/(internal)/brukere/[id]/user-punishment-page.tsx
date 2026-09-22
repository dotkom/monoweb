import { MarkTable } from "@/app/(internal)/prikker/MarkTable"
import { useMarkFindManyInfiniteQuery } from "@/app/(internal)/prikker/queries"
import { Skeleton, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { useUserDetailsContext } from "./provider"

export const UserPunishmentPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { marks, fetchNextPage, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage } =
    useMarkFindManyInfiniteQuery({
      filter: {
        byGivenToUserId: [user.id],
      },
    })

  return (
    <Stack>
      <Title order={2}>Prikker</Title>
      <Skeleton visible={isLoading}>
        <MarkTable
          marks={marks}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </Skeleton>
    </Stack>
  )
}
