"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useMarkTable } from "src/modules/mark/use-mark-table"
import { useMarkAllQuery } from "src/modules/mark/queries/use-mark-all-query"
import { useCreateMarkModal } from "src/modules/mark/modals/create-mark-modal"

export default function MarkPage() {
  const { marks, isLoading: isMarksLoading } = useMarkAllQuery()
  const open = useCreateMarkModal()

  const table = useMarkTable({ data: marks })

  return (
    <Skeleton visible={isMarksLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Legg inn ny prikk</Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
