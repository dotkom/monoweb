"use client"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "src/components/GenericTable"
import { useCreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal"
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query"
import { useInterestGroupTable } from "src/modules/interest-group/use-interest-group-table"

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
