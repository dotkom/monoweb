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
  AvatarGroup,
  AvatarImage,
  cn,
  Text,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowUpRight, IconTrophy, IconUser, IconUsers, IconX } from "@tabler/icons-react"
import Link from "next/link"

export type TeamModalProps = {
  contestant: ContestantDetail | null
  rank: number | null
  userId: string | null
  onClose: () => void
}

export function TeamModal({ contestant, rank, userId, onClose }: TeamModalProps) {
  const fullPathname = useFullPathname()

  const isAuthenticated = userId !== null
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
      <AlertDialogContent
        size="lg"
        onOutsideClick={onClose}
        className="max-h-[85dvh] min-h-80 overflow-y-auto bg-[#ede3d4] dark:bg-taupe-800 flex flex-col gap-4"
      >
        <AlertDialogHeader className="flex flex-row items-start justify-between gap-4 min-w-0">
          <AlertDialogTitle className="font-marcellus font-semibold tracking-wide text-2xl truncate">
            {teamName}
          </AlertDialogTitle>
          <AlertDialogCancel variant="ghost" size="icon" aria-label="Lukk" className="-mt-1 -mr-1 shrink-0">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </AlertDialogHeader>

        <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-1">
          <div className="flex flex-row items-center gap-2 text-[#7a533b] dark:text-[#ddb8a0]">
            <IconTrophy className="size-5" />
            <Text className="flex items-center gap-1 ">
              {rank !== null && `${rank}. plass med `}
              {contestant?.resultValue ?? 0} poeng
            </Text>
          </div>

          <Text className="flex items-center gap-2 text-[#7a533b] dark:text-[#ddb8a0]">
            <IconUsers className="size-5" />
            {memberCount} deltakere
          </Text>
        </div>

        {membersAreHidden ? (
          <a
            href={createAuthorizeUrl({ returnTo: fullPathname })}
            className="flex flex-col items-center gap-3 rounded-lg bg-muted dark:bg-stone-900 hover:bg-muted/50 dark:hover:bg-muted/24 transition-colors p-4 text-center"
          >
            <AvatarGroup>
              {Array.from({ length: Math.min(memberCount, 5) }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
                <Avatar key={index}>
                  <AvatarFallback>
                    <IconUser className="size-4" />
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>

            <Text className="text-muted-foreground">Du må være logget inn for å se deltagerne.</Text>

            <div className="flex flex-row items-center gap-1">
              Logg inn
              <IconArrowUpRight className="size-4" />
            </div>
          </a>
        ) : (
          <ul className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/profil/${member.username}`}
                  className={cn(
                    "flex items-center gap-2 rounded-xl p-2 -m-2 bg-white/12 dark:bg-black/6 hover:bg-white/25 dark:hover:bg-black/18 transition-colors",
                    member.id === userId &&
                      "bg-blue-200/50 hover:bg-blue-200 dark:bg-blue-800/16 dark:hover:bg-blue-800/35"
                  )}
                >
                  <Avatar size="lg">
                    <AvatarImage src={member.imageUrl ?? undefined} alt={member.name ?? member.username} />
                    <AvatarFallback>
                      <IconUser className="size-5" />
                    </AvatarFallback>
                  </Avatar>

                  <Text className="truncate">{member.name ?? member.username}</Text>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
