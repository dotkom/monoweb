"use client"

import { GenericTable } from "@/components/GenericTable"
import type { ContestantDetail } from "@dotkomonline/types"
import { Button, Group, NumberInput, Stack } from "@mantine/core"
import { IconTrophy } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useSetWinnerMutation, useUpdateContestantResultMutation } from "../mutations"
import { useContestContext } from "./provider"

const ScoreCell = ({ contestant }: { contestant: ContestantDetail }) => {
  const updateResult = useUpdateContestantResultMutation()
  const [value, setValue] = useState<number | string>(contestant.resultValue ?? "")

  const handleBlur = () => {
    const numValue = typeof value === "string" ? null : value
    if (numValue !== contestant.resultValue) {
      updateResult.mutate({ id: contestant.id, resultValue: numValue })
    }
  }

  return (
    <NumberInput
      size="xs"
      value={value}
      onChange={setValue}
      onBlur={handleBlur}
      placeholder="—"
      style={{ width: 100 }}
      allowDecimal={false}
    />
  )
}

export const ResultatPage = () => {
  const { contest, contestants } = useContestContext()
  const setWinner = useSetWinnerMutation()

  const sorted = useMemo(() => {
    const withResults = [...contestants].sort((a, b) => {
      if (a.resultValue == null && b.resultValue == null) return 0
      if (a.resultValue == null) return 1
      if (b.resultValue == null) return -1
      return contest.resultOrder === "ASC"
        ? a.resultValue - b.resultValue
        : b.resultValue - a.resultValue
    })
    return withResults
  }, [contestants, contest.resultOrder])

  const columnHelper = createColumnHelper<ContestantDetail>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rank",
        header: () => "#",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.display({
        id: "name",
        header: () => "Deltaker",
        cell: (info) => {
          const row = info.row.original
          if (row.team) return row.team.name
          return row.user?.name ?? "Ukjent"
        },
      }),
      columnHelper.display({
        id: "score",
        header: () => "Resultat",
        cell: (info) => <ScoreCell contestant={info.row.original} />,
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
                        contestantId: isWinner ? null : info.row.original.id,
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
    ],
    [columnHelper, contest, setWinner]
  )

  const table = useReactTable({
    data: sorted,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const handlePublishWinner = () => {
    const topContestant = sorted[0]
    if (topContestant) {
      setWinner.mutate({ contestId: contest.id, contestantId: topContestant.id })
    }
  }

  return (
    <Stack>
      {contest.resultType !== "WINNER" && (
        <Group>
          <Button
            leftSection={<IconTrophy width={14} height={14} />}
            onClick={handlePublishWinner}
            disabled={sorted.length === 0 || sorted[0].resultValue == null}
          >
            Publiser vinner
          </Button>
        </Group>
      )}

      <GenericTable table={table} />
    </Stack>
  )
}
