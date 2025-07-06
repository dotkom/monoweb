"use client"
import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
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
        <Box>
          <Button onClick={open}>Opprett interessegruppe</Button>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}

export default InterestGroupPage
