"use client"

import type { ContestUserSummary } from "@dotkomonline/rpc/contest"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Text,
} from "@dotkomonline/ui"
import { IconUser, IconX } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type ContestantTeamMembersModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamName: string
  members: ContestUserSummary[]
}

export function ContestantTeamMembersModal({ open, onOpenChange, teamName, members }: ContestantTeamMembersModalProps) {
  const [display, setDisplay] = useState({ teamName, members })

  useEffect(() => {
    if (open) {
      setDisplay({ teamName, members })
    }
  }, [open, teamName, members])

  const memberLabel = display.members.length === 1 ? "1 medlem" : `${display.members.length} medlemmer`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <AlertDialogTitle className="truncate">{display.teamName}</AlertDialogTitle>
            <Text className="text-sm text-muted-foreground">{memberLabel}</Text>
          </div>
          <AlertDialogCancel type="button" className="shrink-0">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {display.members.length === 0 ? (
          <Text className="text-sm text-muted-foreground">Ingen medlemmer</Text>
        ) : (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {display.members.map((member) => {
              const displayName = member.name ?? member.username

              return (
                <li key={member.id}>
                  <Link
                    href={`/brukere/${member.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <Avatar className="size-9 shrink-0">
                      {member.imageUrl && <AvatarImage src={member.imageUrl} alt="" />}
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <IconUser className="size-4" aria-hidden />
                      </AvatarFallback>
                    </Avatar>
                    <Text className="min-w-0 truncate text-sm font-medium">{displayName}</Text>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
