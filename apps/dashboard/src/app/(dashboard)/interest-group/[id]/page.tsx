"use client"

import { Icon } from "@iconify/react"
import { Box, Button, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { useDeleteInterestGroupMutation } from "src/modules/interest-group/mutations/use-delete-interest-group-mutation"
import { useInterestGroupDetailsContext } from "./provider"
// import { OfflineEditCard } from "./edit-card"

export default function InterestGroupDetailsPage() {
  const { interestGroup } = useInterestGroupDetailsContext()
  const router = useRouter()

  const remove = useDeleteInterestGroupMutation()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>Test</Title>
      </Group>

      <Button
        color="red"
        onClick={() => {
          remove.mutate(interestGroup.id)
          router.back()
        }}
      >
        Delete
      </Button>
    </Box>
  )
}
