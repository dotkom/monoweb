"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { GenericTable } from "@/components/GenericTable"
import type { ContestantDetail } from "@dotkomonline/types"
import { Badge, Button, Group, Modal, Stack, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconTrash, IconUserPlus, IconUsersPlus } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useAddContestantMutation, useRemoveContestantMutation } from "../mutations"
import { useContestContext } from "./provider"

export const DeltagarePage = () => {
  const { contest, contestants } = useContestContext()
  const addContestant = useAddContestantMutation()
  const removeContestant = useRemoveContestantMutation()

  const [addIndividualOpened, { open: openAddIndividual, close: closeAddIndividual }] = useDisclosure(false)
  const [addTeamOpened, { open: openAddTeam, close: closeAddTeam }] = useDisclosure(false)
  const [teamName, setTeamName] = useState("")
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])

  const handleAddIndividual = (user: { id: string }) => {
    addContestant.mutate({ contestId: contest.id, userId: user.id })
    closeAddIndividual()
  }

  const handleAddTeam = () => {
    if (!teamName.trim()) return
    addContestant.mutate({
      contestId: contest.id,
      userId: null,
      teamName: teamName.trim(),
      memberIds: teamMembers.map((m) => m.id),
    })
    setTeamName("")
    setTeamMembers([])
    closeAddTeam()
  }

  const columnHelper = createColumnHelper<ContestantDetail>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "name",
        header: () => "Navn",
        cell: (info) => {
          const row = info.row.original
          if (row.team) {
            return (
              <Group gap="xs">
                {row.team.name}
                {row.team.members.map((m) => (
                  <Badge key={m.id} variant="light" size="sm">
                    {m.name}
                  </Badge>
                ))}
              </Group>
            )
          }
          return row.user?.name ?? "Ukjent"
        },
      }),
      columnHelper.display({
        id: "type",
        header: () => "Type",
        cell: (info) => (info.row.original.team ? "Lag" : "Individ"),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: (info) => (
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconTrash width={14} height={14} />}
            onClick={() => removeContestant.mutate({ id: info.row.original.id })}
          >
            Slett
          </Button>
        ),
      }),
    ],
    [columnHelper, removeContestant]
  )

  const table = useReactTable({
    data: contestants,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const existingUserIds = contestants
    .filter((c) => c.user)
    .map((c) => c.userId!)

  return (
    <Stack>
      <Group>
        <Button leftSection={<IconUserPlus width={14} height={14} />} onClick={openAddIndividual}>
          Legg til individ
        </Button>
        <Button leftSection={<IconUsersPlus width={14} height={14} />} onClick={openAddTeam} variant="light">
          Legg til lag
        </Button>
      </Group>

      <Modal opened={addIndividualOpened} onClose={closeAddIndividual} title="Legg til individ" centered>
        <UserSearch onSubmit={handleAddIndividual} excludeUserIds={existingUserIds} />
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
          <UserSearch
            onSubmit={(user) => {
              if (!teamMembers.find((m) => m.id === user.id)) {
                setTeamMembers([...teamMembers, { id: user.id, name: user.name ?? user.email ?? user.id }])
              }
            }}
            excludeUserIds={teamMembers.map((m) => m.id)}
            placeholder="Søk etter medlem..."
          />
          <Group gap="xs">
            {teamMembers.map((m) => (
              <Badge
                key={m.id}
                variant="light"
                rightSection={
                  <IconTrash
                    width={12}
                    height={12}
                    style={{ cursor: "pointer" }}
                    onClick={() => setTeamMembers(teamMembers.filter((tm) => tm.id !== m.id))}
                  />
                }
              >
                {m.name}
              </Badge>
            ))}
          </Group>
          <Button onClick={handleAddTeam} disabled={!teamName.trim()}>
            Legg til lag
          </Button>
        </Stack>
      </Modal>

      <GenericTable table={table} />
    </Stack>
  )
}
