"use client"

import { Icon } from "@iconify/react"
import { Box, Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import { AllArticlesTable } from "./all-articles-table"
import { useCreateArticleModal } from "./modals/create-article"
import { useArticleAllQuery } from "./queries"

export default function CompanyPage() {
  const { articles, isLoading: isArticlesLoading } = useArticleAllQuery()
  const open = useCreateArticleModal()

  return (
    <Skeleton visible={isArticlesLoading}>
      <Stack>
        <Box>
          <Button onClick={open}>Opprett artikkel</Button>
        </Box>
        <AllArticlesTable articles={articles} />
        <ButtonGroup ml="auto">
          <Button variant="subtle">
            <Icon icon="tabler:caret-left" />
          </Button>
          <Button variant="subtle">
            <Icon icon="tabler:caret-right" />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
