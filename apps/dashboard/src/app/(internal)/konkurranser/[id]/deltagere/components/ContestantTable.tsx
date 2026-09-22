"use client"

import { DataTable } from "@/components/DataTable"
import { useContestEditPermission } from "@/hooks/use-contest-edit-permission"
import type { ContestantDetail, ContestUserSummary } from "@dotkomonline/rpc/contest"
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage, Button, cn, Text, TextLink } from "@dotkomonline/ui"
import { IconPencil, IconTrash, IconUser, IconUsersGroup } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRemoveContestantMutation, useUpdateTeamContestantMutation } from "../../../mutations"
import { ContestantResultInput } from "./ContestantResultInput"
import { ContestantTeamMembersModal } from "./ContestantTeamMembersModal"
import { TeamContestantWriteModal } from "./TeamContestantWriteModal"

type TableModalState =
  | { kind: "edit-team"; contestant: ContestantDetail }
  | { kind: "members"; teamName: string; members: ContestUserSummary[] }

export type ContestantTableProps = {
  contestants: ContestantDetail[]
  resultSuffix?: string
  excludeUserIds: string[]
}

export function ContestantTable({ contestants, resultSuffix, excludeUserIds }: ContestantTableProps) {
  const canEdit = useContestEditPermission()
  const removeContestant = useRemoveContestantMutation()
  const updateTeamContestant = useUpdateTeamContestantMutation()
  const [modal, setModal] = useState<TableModalState | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

  useEffect(() => {
    if (flashId === null) {
      return
    }

    const timeout = setTimeout(() => {
      setFlashId(null)
    }, 800)

    return () => {
      clearTimeout(timeout)
    }
  }, [flashId])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

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

          if (row.team !== null) {
            return (
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                  <IconUsersGroup className="size-4" aria-hidden />
                </span>
                <Text className="text-sm">{row.team.name}</Text>
              </div>
            )
          }

          const name = row.user?.name ?? "Ukjent"

          return (
            <TextLink
              href={`/brukere/${row.user?.id}`}
              className="group/user -mx-1 flex w-fit max-w-full items-center gap-2 rounded-sm px-1 py-1 text-sm no-underline hover:bg-muted/70"
            >
              <Avatar className="size-7">
                {row.user?.imageUrl && <AvatarImage src={row.user.imageUrl} />}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <IconUser className="size-3.5" aria-hidden />
                </AvatarFallback>
              </Avatar>
              <span className="underline decoration-muted-foreground/40 underline-offset-2 group-hover/user:decoration-foreground/50">
                {name}
              </span>
            </TextLink>
          )
        },
      }),
      columnHelper.display({
        id: "members",
        header: () => "Medlemmer",
        cell: (info) => {
          const team = info.row.original.team

          if (team === null) {
            return <Text className="text-sm text-muted-foreground">—</Text>
          }

          if (team.members.length === 0) {
            return <Text className="text-sm text-muted-foreground">Ingen medlemmer</Text>
          }

          const memberCountLabel = `${team.members.length} medlem${team.members.length === 1 ? "" : "mer"}`

          return (
            <Button
              variant="ghost"
              className={cn(
                "group/members -mx-1 flex max-w-full items-center gap-2 rounded-md px-1 py-1 text-left",
                "text-sm text-muted-foreground transition-colors",
                "hover:bg-muted/70 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              onClick={() => {
                setModal({
                  kind: "members",
                  teamName: team.name,
                  members: team.members,
                })
              }}
            >
              <AvatarGroup>
                {team.members.map((member) => (
                  <Avatar key={member.id} className="size-7">
                    {member.imageUrl && <AvatarImage src={member.imageUrl} alt="" />}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <IconUser className="size-3.5" aria-hidden />
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <Text className="text-sm underline decoration-muted-foreground/40 underline-offset-2 group-hover/members:decoration-foreground/50">
                {memberCountLabel}
              </Text>
            </Button>
          )
        },
      }),
      columnHelper.display({
        id: "score",
        header: () => "Resultat",
        cell: (info) => (
          <ContestantResultInput
            contestant={info.row.original}
            disabled={!canEdit}
            suffix={resultSuffix}
            onSaved={setFlashId}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: (info) => {
          const isTeam = info.row.original.team !== null

          return (
            <div className="flex justify-end gap-1">
              {isTeam && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!canEdit}
                  icon={<IconPencil className="size-4" />}
                  onClick={() => {
                    setModal({ kind: "edit-team", contestant: info.row.original })
                  }}
                >
                  Rediger
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                disabled={!canEdit}
                icon={<IconTrash className="size-4" />}
                onClick={() => {
                  removeContestant.mutate({ contestantId: info.row.original.id })
                }}
              >
                Slett
              </Button>
            </div>
          )
        },
      }),
    ],
    [columnHelper, canEdit, removeContestant, resultSuffix]
  )

  const table = useReactTable({
    data: contestants,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const editContestant = modal?.kind === "edit-team" ? modal.contestant : null

  return (
    <>
      <TeamContestantWriteModal
        open={modal?.kind === "edit-team"}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
        title="Rediger lag"
        submitLabel="Lagre"
        requireMembers
        initialTeamName={editContestant?.team?.name ?? ""}
        initialMembers={
          editContestant?.team?.members.map((member) => ({
            id: member.id,
            name: member.name ?? member.username,
          })) ?? []
        }
        excludeUserIds={excludeUserIds}
        disabled={!canEdit}
        isPending={updateTeamContestant.isPending}
        onSubmit={(data) => {
          if (editContestant === null) {
            return
          }

          updateTeamContestant.mutate(
            {
              contestantId: editContestant.id,
              data: {
                teamName: data.teamName,
                memberIds: data.memberIds,
              },
            },
            { onSuccess: () => closeModal() }
          )
        }}
      />

      <ContestantTeamMembersModal
        open={modal?.kind === "members"}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
        teamName={modal?.kind === "members" ? modal.teamName : ""}
        members={modal?.kind === "members" ? modal.members : []}
      />

      <DataTable
        table={table}
        getRowClassName={(row) =>
          row.original.id === flashId
            ? "bg-yellow-100 hover:bg-yellow-100 dark:bg-yellow-500/20 dark:hover:bg-yellow-500/20"
            : undefined
        }
      />
    </>
  )
}
