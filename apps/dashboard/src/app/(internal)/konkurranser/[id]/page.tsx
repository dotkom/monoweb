"use client"

import { Badge, Box, Button, Group, Modal, Stack, Tabs, Text, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconArrowLeft,
  IconCancel,
  IconListDetails,
  IconTrash,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDeleteContestMutation } from "../mutations"
import { InfoPage } from "./info-page"
import { DeltagarePage } from "./deltagere-page"
import { ResultatPage } from "./resultat-page"
import { useContestContext } from "./provider"

const TABS = [
  { icon: IconListDetails, label: "Info", slug: "info", component: InfoPage },
  { icon: IconUsers, label: "Deltagere", slug: "deltagere", component: DeltagarePage },
  { icon: IconTrophy, label: "Resultat", slug: "resultat", component: ResultatPage },
]

export default function ContestDetailPage() {
  const { contest, contestants } = useContestContext()
  const router = useRouter()
  const deleteContest = useDeleteContestMutation()
  const [opened, { open, close }] = useDisclosure(false)
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || TABS[0].slug

  const winner = contest.winnerContestantId
    ? contestants.find((c) => c.id === contest.winnerContestantId)
    : null

  const winnerName = winner
    ? winner.team
      ? winner.team.name
      : winner.user?.name ?? "Ukjent"
    : null

  const handleTabChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value ?? TABS[0].slug)
    router.replace(`/konkurranser/${contest.id}?${params.toString()}`)
  }

  return (
    <Stack>
      {winnerName && (
        <Box style={{ borderRadius: "var(--mantine-radius-md)" }} bg="yellow.1" p="md">
          <Group gap="xs">
            <IconTrophy size={20} color="gold" />
            <Text fw={600}>Vinner: {winnerName}</Text>
          </Group>
        </Box>
      )}

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
                  deleteContest.mutate({ id: contest.id })
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
            Slett
          </Button>
        </Group>
      </Group>

      <Group>
        <Title>{contest.name}</Title>
        <Badge variant="light">{contest.groupId}</Badge>
      </Group>

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
