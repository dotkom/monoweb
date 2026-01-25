import type { FC } from "react"
import { PunishmentTable } from "@/app/(internal)/prikker/punishment-table"
import { usePunishmentAllInfiniteQuery } from "@/app/(internal)/prikker/queries/use-punishment-all-query"
import { useUserDetailsContext } from "./provider"
import { Skeleton, Stack, Title } from "@mantine/core"

export const UserPunishmentPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { marks, fetchNextPage, isLoading } = usePunishmentAllInfiniteQuery({
    byGivenToUserId: [user.id],
  })

  return (
    <Stack>
      <Title order={2}>Prikker</Title>
      <Skeleton visible={isLoading}>
        <PunishmentTable marks={marks} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
