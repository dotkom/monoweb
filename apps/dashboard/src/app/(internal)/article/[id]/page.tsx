"use client"

import { Box, CloseButton, Group, Tabs, Title } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { ArticleEditCard } from "./edit-card"
import { useArticleDetailsContext } from "./provider"

const SIDEBAR_LINKS = [
  {
    icon: IconPhoto,
    label: "Info",
    slug: "info",
    component: ArticleEditCard,
  },
] as const

export default function ArticleDetailsPage() {
  const { article } = useArticleDetailsContext()
  const router = useRouter()
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{article.title}</Title>
      </Group>

      <Tabs defaultValue={SIDEBAR_LINKS[0].slug}>
        <Tabs.List>
          {SIDEBAR_LINKS.map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SIDEBAR_LINKS.map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  )
}
