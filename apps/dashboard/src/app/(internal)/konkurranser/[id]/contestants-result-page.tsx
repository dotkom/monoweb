"use client"

import { UserCombobox } from "@/app/(internal)/brukere/components/user-combobox"
import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { GenericTable } from "@/components/GenericTable"
import type { ContestantDetail } from "@dotkomonline/rpc/contest"
import {
  Avatar,
  AvatarGroup,
  Button,
  Center,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconAwardFilled,
  IconPencil,
  IconTrash,
  IconTrophy,
  IconTrophyOff,
  IconUser,
  IconUserPlus,
  IconUsersGroup,
  IconUsersPlus,
} from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import {
  useAddContestantMutation,
  useRemoveContestantMutation,
  useSetWinnerMutation,
  useUpdateContestantResultMutation,
  useUpdateTeamContestantMutation,
} from "../mutations"
import { useContestContext } from "./provider"

const ScoreCell = ({ contestant, suffix }: { contestant: ContestantDetail; suffix?: string }) => {
  const updateResult = useUpdateContestantResultMutation()
  const [value, setValue] = useState<number | string>(contestant.resultValue ?? "")

  const handleBlur = () => {
    const numValue = typeof value === "string" ? null : value

    if (numValue !== contestant.resultValue) {
      updateResult.mutate({ contestantId: contestant.id, data: { resultValue: numValue } })
    }
  }

  return (
    <NumberInput
      size="xs"
      value={value}
      onChange={setValue}
      onBlur={handleBlur}
      placeholder="—"
      style={{ width: 120 }}
      allowDecimal={false}
      suffix={suffix ? ` ${suffix}` : undefined}
    />
  )
}

export const DeltagarePage = () => {
  const { contest, contestants } = useContestContext()
  const addContestant = useAddContestantMutation()
  const removeContestant = useRemoveContestantMutation()
  const updateTeamContestant = useUpdateTeamContestantMutation()
  const setWinner = useSetWinnerMutation()

  const [addIndividualOpened, { open: openAddIndividual, close: closeAddIndividual }] = useDisclosure(false)
  const [addTeamOpened, { open: openAddTeam, close: closeAddTeam }] = useDisclosure(false)
  const [editTeamOpened, { open: openEditTeamModal, close: closeEditTeamModal }] = useDisclosure(false)
  const [teamName, setTeamName] = useState("")
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [editingContestantId, setEditingContestantId] = useState<string | null>(null)
  const [editTeamName, setEditTeamName] = useState("")
  const [editTeamMembers, setEditTeamMembers] = useState<{ id: string; name: string }[]>([])

  const handleAddIndividual = (user: { id: string }) => {
    addContestant.mutate({ contestId: contest.id, data: { userId: user.id } })
    closeAddIndividual()
  }

  const handleAddTeam = () => {
    if (teamName.trim() === "") {
      return
    }

    addContestant.mutate({
      contestId: contest.id,
      data: {
        teamName: teamName.trim(),
        memberIds: teamMembers.map((m) => m.id),
      },
    })

    setTeamName("")
    setTeamMembers([])
    closeAddTeam()
  }

  const handleCloseEditTeam = useCallback(() => {
    setEditingContestantId(null)
    setEditTeamName("")
    setEditTeamMembers([])
    closeEditTeamModal()
  }, [closeEditTeamModal])

  const handleOpenEditTeam = useCallback(
    (row: ContestantDetail) => {
      if (row.team === null) {
        return
      }

      setEditingContestantId(row.id)
      setEditTeamName(row.team.name)
      setEditTeamMembers(
        row.team.members.map((member) => ({
          id: member.id,
          name: member.name ?? member.username,
        }))
      )
      openEditTeamModal()
    },
    [openEditTeamModal]
  )

  const handleSaveEditTeam = useCallback(() => {
    if (editingContestantId === null) {
      return
    }

    if (editTeamName.trim() === "") {
      return
    }

    updateTeamContestant.mutate(
      {
        contestantId: editingContestantId,
        data: {
          teamName: editTeamName.trim(),
          memberIds: editTeamMembers.map((member) => member.id),
        },
      },
      { onSuccess: () => handleCloseEditTeam() }
    )
  }, [editingContestantId, editTeamName, editTeamMembers, handleCloseEditTeam, updateTeamContestant.mutate])

  const sortedContestants = useMemo(() => {
    return contestants.toSorted((a, b) => {
      if (a.resultValue == null && b.resultValue == null) {
        return 0
      }

      if (a.resultValue == null) {
        return 1
      }

      if (b.resultValue == null) {
        return -1
      }

      if (contest.resultOrder === "DESC") {
        return b.resultValue - a.resultValue
      }

      return a.resultValue - b.resultValue
    })
  }, [contestants, contest.resultOrder])

  const handlePublishWinner = () => {
    const topContestant = sortedContestants[0]
    if (topContestant) {
      setWinner.mutate({ contestId: contest.id, data: { contestantId: topContestant.id } })
    }
  }

  const handleClearWinner = () => {
    setWinner.mutate({ contestId: contest.id, data: { contestantId: null } })
  }

  const canRemoveScoreOrDurationWinner =
    (contest.resultType === "SCORE" || contest.resultType === "DURATION") && contest.winnerContestantId !== null

  const columnHelper = createColumnHelper<ContestantDetail>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rank",
        header: () => "Plassering",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.display({
        id: "name",
        header: () => "Deltaker",
        cell: (info) => {
          const row = info.row.original

          const Icon = row.team !== null ? IconUsersGroup : IconUser
          const name = row.team !== null ? row.team.name : (row.user?.name ?? "Ukjent")

          return (
            <Group gap="xs">
              <Center
                bg={row.team !== null ? "var(--mantine-color-blue-light)" : "var(--mantine-color-gray-light)"}
                p="0.25rem"
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
              >
                <Icon width={16} height={16} />
              </Center>
              <Text size="sm">{name}</Text>
            </Group>
          )
        },
      }),
      columnHelper.display({
        id: "members",
        header: () => "Medlemmer",
        cell: (info) => {
          if (info.row.original.team == null) {
            return "-"
          }

          const members = info.row.original.team.members

          if (members.length === 0) {
            return "Ingen medlemmer"
          }

          return (
            <Group gap="xs">
              <AvatarGroup>
                {members.map((m) => (
                  <Avatar
                    key={m.id}
                    src={m.imageUrl}
                    title={m.name ?? "<Ukjent navn>"}
                    alt={m.name ?? "<Ukjent navn>"}
                    size="sm"
                  >
                    <IconUser width={12} height={12} />
                  </Avatar>
                ))}
              </AvatarGroup>

              <Text size="sm" c="dimmed">
                {members.length} medlem{members.length === 1 ? "" : "mer"}
              </Text>
            </Group>
          )
        },
      }),
      columnHelper.display({
        id: "score",
        header: () => "Resultat",
        cell: (info) => (
          <ScoreCell
            contestant={info.row.original}
            suffix={
              contest.resultType === "DURATION" ? "sekunder" : contest.resultType === "SCORE" ? "poeng" : undefined
            }
          />
        ),
      }),
      ...(contest.resultType === "WINNER"
        ? [
            columnHelper.display({
              id: "winner",
              header: () => "",
              cell: (info) => {
                const isWinner = contest.winnerContestantId === info.row.original.id
                return (
                  <Button
                    variant={isWinner ? "filled" : "subtle"}
                    color={isWinner ? "yellow" : "gray"}
                    size="xs"
                    leftSection={<IconTrophy width={14} height={14} />}
                    onClick={() =>
                      setWinner.mutate({
                        contestId: contest.id,
                        data: { contestantId: isWinner ? null : info.row.original.id },
                      })
                    }
                  >
                    {isWinner ? "Vinner" : "Velg vinner"}
                  </Button>
                )
              },
            }),
          ]
        : []),
      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: (info) => {
          const isTeam = info.row.original.team !== null

          return (
            <Group justify="end">
              {isTeam && (
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<IconPencil width={14} height={14} />}
                  onClick={() => handleOpenEditTeam(info.row.original)}
                >
                  Rediger
                </Button>
              )}
              <Button
                variant="subtle"
                color="red"
                size="sm"
                leftSection={<IconTrash width={14} height={14} />}
                onClick={() => removeContestant.mutate({ contestantId: info.row.original.id })}
              >
                Slett
              </Button>
            </Group>
          )
        },
      }),
    ],
    [columnHelper, contest, handleOpenEditTeam, removeContestant, setWinner]
  )

  const table = useReactTable({
    data: sortedContestants,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const contestParticipantUserIds = useMemo(() => {
    const userIds = new Set<string>()

    for (const contestant of contestants) {
      if (contestant.userId !== null) {
        userIds.add(contestant.userId)
      }

      if (contestant.team !== null) {
        for (const member of contestant.team.members) {
          userIds.add(member.id)
        }
      }
    }

    return [...userIds]
  }, [contestants])

  const winner = contest.winnerContestantId ? contestants.find((c) => c.id === contest.winnerContestantId) : null
  const winnerName = winner ? (winner.team ? winner.team.name : (winner.user?.name ?? "Ukjent")) : null

  return (
    <Stack>
      <Stack gap="xs">
        <Group
          style={{ borderRadius: "var(--mantine-radius-md)" }}
          bg={winner ? "var(--mantine-color-yellow-light)" : "var(--mantine-color-gray-light)"}
          p="md"
        >
          <IconAwardFilled
            color={winner ? "var(--mantine-color-yellow-light-color)" : "var(--mantine-color-gray-light-color)"}
            size={32}
          />

          <Stack gap="0.25rem">
            <Text size="sm">Vinner</Text>
            {winnerName ? (
              <>
                <Text fw={600} size="lg">
                  {winnerName}
                </Text>
                <Text size="sm" c="dimmed">
                  {winner?.resultValue}{" "}
                  {contest.resultType === "DURATION"
                    ? "sekunder"
                    : contest.resultType === "SCORE"
                      ? "poeng"
                      : undefined}
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">
                Ingen vinner enda. Husk at du må oppdatere resultatene før du kan publisere en vinner.
              </Text>
            )}
          </Stack>
        </Group>

        {contest.resultType !== "WINNER" && (
          <>
            <Group w="fit-content">
              <Button
                variant="light"
                color={contest.winnerContestantId ? "gray" : undefined}
                c={contest.winnerContestantId ? "var(--mantine-color-text)" : undefined}
                onClick={handlePublishWinner}
                disabled={sortedContestants.length === 0 || sortedContestants[0].resultValue == null}
                leftSection={<IconTrophy width={14} height={14} />}
              >
                {contest.winnerContestantId ? "Oppdater vinner" : "Publiser vinner"}
              </Button>

              {canRemoveScoreOrDurationWinner && (
                <Button
                  variant="subtle"
                  color="red"
                  onClick={handleClearWinner}
                  leftSection={<IconTrophyOff width={14} height={14} />}
                >
                  Fjern vinner
                </Button>
              )}
            </Group>

            {contest.winnerContestantId === null && (
              <Text size="xs" c="dimmed">
                Vinner kan oppdateres etter publisering
              </Text>
            )}
          </>
        )}
      </Stack>

      <Divider />

      <Group align="flex-start" wrap="wrap">
        <Button leftSection={<IconUserPlus width={14} height={14} />} onClick={openAddIndividual}>
          Legg til individ
        </Button>
        <Button leftSection={<IconUsersPlus width={14} height={14} />} onClick={openAddTeam}>
          Legg til lag
        </Button>
      </Group>

      <Modal opened={addIndividualOpened} onClose={closeAddIndividual} title="Legg til individ" centered>
        <UserSearch onSubmit={handleAddIndividual} excludeUserIds={contestParticipantUserIds} />
      </Modal>

      <Modal opened={addTeamOpened} onClose={closeAddTeam} title="Legg til lag" centered>
        <Stack>
          <TextInput
            label="Lagnavn"
            placeholder="Skriv inn lagnavn..."
            value={teamName}
            onChange={(e) => setTeamName(e.currentTarget.value)}
            withAsterisk
          />

          <UserCombobox
            multiselect
            excludeUserIds={contestParticipantUserIds}
            label="Medlemmer"
            onChange={setTeamMembers}
            placeholder="Søk etter medlemmer…"
            value={teamMembers}
          />

          <Button onClick={handleAddTeam} disabled={!teamName.trim()}>
            Legg til lag
          </Button>
        </Stack>
      </Modal>

      <Modal opened={editTeamOpened} onClose={handleCloseEditTeam} title="Rediger lag" centered>
        <Stack>
          <TextInput
            label="Lagnavn"
            placeholder="Skriv inn lagnavn..."
            value={editTeamName}
            onChange={(e) => setEditTeamName(e.currentTarget.value)}
            withAsterisk
          />

          <UserCombobox
            multiselect
            excludeUserIds={contestParticipantUserIds}
            label="Medlemmer"
            onChange={setEditTeamMembers}
            placeholder="Søk etter medlemmer…"
            value={editTeamMembers}
          />

          <Button
            onClick={handleSaveEditTeam}
            disabled={!editTeamName.trim() || editTeamMembers.length === 0}
            loading={updateTeamContestant.isPending}
          >
            Lagre
          </Button>
        </Stack>
      </Modal>

      <GenericTable table={table} />
    </Stack>
  )
}
