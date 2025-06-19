"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { useCreateArticleModal } from "../../../modules/article/modals/create-article-modal"
import { useArticleAllQuery } from "../../../modules/article/queries/use-article-all-query"
import { AllArticlesTable } from "./all-articles-table"

export default function CompanyPage() {
  const { articles, isLoading: isArticlesLoading } = useArticleAllQuery()
  const open = useCreateArticleModal()

  return (
    <Skeleton visible={isArticlesLoading}>
      <Stack>
        <AllArticlesTable articles={articles} />
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
