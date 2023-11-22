"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { useWebshopPurchaseAllQuery } from "./helpers/queries"
import { useWebshopPurchaseTable } from "./helpers/use-purchase-table"
import { GenericTable } from "../../../components/GenericTable"

export default function WebshopPurchasePage() {
  const { webshopPurchase, isLoading: isWebshopPurchasesLoading } = useWebshopPurchaseAllQuery()
  const table = useWebshopPurchaseTable({ data: webshopPurchase })

  return (
    <Skeleton visible={isWebshopPurchasesLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
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
