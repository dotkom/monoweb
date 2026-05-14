"use client"

import { Button, Group, Modal, Stack, Tabs, Text, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconArrowLeft, IconCancel, IconListDetails, IconTrash, IconUsers } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { useDeleteContestMutation } from "../mutations"
import { InfoPage } from "./info-page"
import { DeltagarePage } from "./contestants-result-page"
import { useContestContext } from "./provider"
import { useGroupAbbreviationMap } from "../../grupper/queries"

const TABS = [
  {
    icon: IconListDetails,
    label: "Info",
    slug: "info",
    component: InfoPage,
  },
  {
    icon: IconUsers,
    label: "Deltagere og resultat",
    slug: "deltagere",
    component: DeltagarePage,
  },
] as const

const TAB_SLUGS = new Set<string>(TABS.map((tab) => tab.slug))

export default function ContestDetailPage() {
  const { contest } = useContestContext()
  const router = useRouter()
  const deleteContest = useDeleteContestMutation()
  const [opened, { open, close }] = useDisclosure(false)
  const searchParams = useSearchParams()
  const { abbreviationBySlug, isLoading: isLoadingGroups } = useGroupAbbreviationMap()
  const organizerSummary = useMemo(() => {
    return contest.groups.map((slug) => abbreviationBySlug.get(slug) ?? slug).join(", ")
  }, [abbreviationBySlug, contest.groups])

  const tabFromQuery = searchParams.get("tab") || TABS[0].slug
  const coercedTab = tabFromQuery === "resultat" ? "deltagere" : tabFromQuery
  const currentTab = TAB_SLUGS.has(coercedTab) ? coercedTab : TABS[0].slug

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? TABS[0].slug)

    router.replace(`/konkurranser/${contest.id}?${params.toString()}`)
  }

  const groupLabel = isLoadingGroups ? "Laster komiteer..." : `Arrangørkomiteer: ${organizerSummary || "—"}`

  return (
    <Stack>
      <Group align="center" justify="space-between">
        <Group>
          <Button
            variant="light"
            onClick={() => router.push("/konkurranser")}
            leftSection={<IconArrowLeft height={14} width={14} />}
          >
            Tilbake
          </Button>
        </Group>

        <Group>
          <Modal opened={opened} onClose={close} title={`Er du sikker på at du vil slette "${contest.name}"?`} centered>
            <Group>
              <Button
                color="red"
                onClick={() => {
                  deleteContest.mutate({ contestId: contest.id })
                  router.push("/konkurranser")
                }}
                leftSection={<IconTrash height={14} width={14} />}
              >
                Ja, slett
              </Button>
              <Button color="gray" onClick={close} leftSection={<IconCancel height={14} width={14} />}>
                Nei
              </Button>
            </Group>
          </Modal>

          <Button color="red" variant="light" onClick={open} leftSection={<IconTrash height={14} width={14} />}>
            Slett konkurranse
          </Button>
        </Group>
      </Group>

      <Stack gap="0.25rem">
        <Title>{contest.name}</Title>
        <Text size="sm" c="dimmed">
          {groupLabel}
        </Text>
      </Stack>

      <Tabs defaultValue={currentTab} onChange={handleTabChange} keepMounted={false}>
        <Tabs.List>
          {TABS.map(({ label, icon: Icon, slug }) => (
            <Tabs.Tab key={slug} value={slug} leftSection={<Icon width={14} height={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {TABS.map(({ slug, component: Component }) => (
          <Tabs.Panel mt="md" key={slug} value={slug}>
            <Component />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
