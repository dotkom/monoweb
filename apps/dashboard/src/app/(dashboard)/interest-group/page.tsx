"use client"
import { Icon } from "@iconify/react"
import { Button, Card, Group, Skeleton, Stack, Tabs, Title } from "@mantine/core"
import { GenericTable } from "src/components/GenericTable"
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query"
import { useCreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"
import { useInterestGroupTable } from "src/modules/interest-group/use-interest-group-table"

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
