"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { useWebshopProductAllQuery } from "./helpers/queries"
import { useWebshopProductTable } from "./helpers/use-product-table"
import { useCreateWebshopProductModal } from "./helpers/modals"
import { GenericTable } from "../../../components/GenericTable"

export default function WebshopProductPage() {
  const { webshopProduct, isLoading: isWebshopProductsLoading } = useWebshopProductAllQuery()
  const table = useWebshopProductTable({ data: webshopProduct })
  const open = useCreateWebshopProductModal()

  return (
    <Skeleton visible={isWebshopProductsLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Legg inn ny Offline</Button>
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
