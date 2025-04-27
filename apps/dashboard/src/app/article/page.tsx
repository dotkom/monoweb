"use client"

import { GenericTable } from "@/components/GenericTable"
import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { useCreateArticleModal } from "./modals/create-article"
import { useArticleAllQuery } from "./queries/article-all"
import { useArticleTable } from "./use-article-table"

export default function CompanyPage() {
  const { articles, isLoading: isArticlesLoading } = useArticleAllQuery()
  const open = useCreateArticleModal()
  const table = useArticleTable({ data: articles })

  return (
    <Skeleton visible={isArticlesLoading}>
      <Stack>
        <GenericTable table={table} />
        <Group justify="space-between">
          <Button onClick={open}>Opprett artikkel</Button>
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
