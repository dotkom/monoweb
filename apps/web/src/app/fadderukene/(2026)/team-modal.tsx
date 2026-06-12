"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import type { ContestantDetail } from "@dotkomonline/rpc/contest"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Text,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconLogin2, IconTrophy, IconUser, IconUsers } from "@tabler/icons-react"
import Link from "next/link"

export type TeamModalProps = {
  contestant: ContestantDetail | null
  rank: number | null
  isAuthenticated: boolean
  onClose: () => void
}

export function TeamModal({ contestant, rank, isAuthenticated, onClose }: TeamModalProps) {
  const fullPathname = useFullPathname()

  const team = contestant?.team ?? null
  const teamName = team?.name ?? contestant?.user?.name ?? "Ukjent lag"
  const members = team?.members ?? []
  const memberCount = team?.memberCount ?? contestant?.participantCount ?? 0
  const membersAreHidden = !isAuthenticated && members.length === 0 && memberCount > 0

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <AlertDialog open={contestant !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={onClose} className="max-h-[85dvh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{teamName}</AlertDialogTitle>

          <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
            {rank !== null && (
              <Text className="flex items-center gap-1 text-sm text-muted-foreground">
                <IconTrophy aria-hidden className="size-4" />
                {rank}. plass
              </Text>
            )}

            <Text className="text-sm text-muted-foreground">{contestant?.resultValue ?? 0} poeng</Text>

            <Text className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconUsers aria-hidden className="size-4" />
              {memberCount} deltakere
            </Text>
          </div>
        </AlertDialogHeader>

        {membersAreHidden ? (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 p-4 text-center">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(memberCount, 5) }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
                <Avatar key={index} className="ring-2 ring-popover">
                  <AvatarFallback>
                    <IconUser aria-hidden className="size-4" />
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            <Text className="text-sm text-muted-foreground">
              Du må være logget inn for å se hvem som er med på laget.
            </Text>

            <Button element="a" href={createAuthorizeUrl({ returnTo: fullPathname })} size="sm">
              <IconLogin2 aria-hidden className="size-4" />
              Logg inn
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/profil/${member.username}`}
                  className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.imageUrl ?? undefined} alt={member.name ?? member.username} />
                    <AvatarFallback>
                      <IconUser aria-hidden className="size-3" />
                    </AvatarFallback>
                  </Avatar>

                  <Text className="truncate text-sm">{member.name ?? member.username}</Text>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <AlertDialogCancel className="justify-self-end">Lukk</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}
