"use client"
import { GenericTable } from "@/components/GenericTable"
import { Button, Card, Group, Skeleton, Stack } from "@mantine/core"
import { useCreateInterestGroupModal } from "./modals/create-interest-group-modal"
import { useInterestGroupAllQuery } from "./queries/use-interest-group-all-query"
import { useInterestGroupTable } from "./use-interest-group-table"

const InterestGroupPage = () => {
  const { interestGroups, isLoading: isInterestGroupsLoading } = useInterestGroupAllQuery()
  const open = useCreateInterestGroupModal()
  const table = useInterestGroupTable({ data: interestGroups })
  return (
    <Skeleton visible={isInterestGroupsLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Opprett interessegruppe</Button>
        </Group>
      </Stack>
    </Skeleton>
  )
}

export default InterestGroupPage
