"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"
import type { ContestResultOrder, ContestUserSummary, ContestantDetail } from "@dotkomonline/rpc/contest"
import { Avatar, AvatarFallback, AvatarImage, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { IconUser } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { TeamModal } from "./team-modal"

const CONTEST_ID = "e368a124-4394-40ea-8354-928a97902e51"

const MAX_VISIBLE_AVATARS = 5

type RankedContestant = {
  contestant: ContestantDetail
  rank: number
}

function rankContestants(contestants: ContestantDetail[], order: ContestResultOrder): RankedContestant[] {
  const sorted = contestants.toSorted((a, b) => {
    if (a.resultValue === null && b.resultValue === null) {
      return 0
    }

    if (a.resultValue === null) {
      return 1
    }

    if (b.resultValue === null) {
      return -1
    }

    if (order === "ASC") {
      return a.resultValue - b.resultValue
    }

    return b.resultValue - a.resultValue
  })

  return sorted.map((contestant, index) => ({ contestant, rank: index + 1 }))
}

function getTeamName(contestant: ContestantDetail) {
  return contestant.team?.name ?? contestant.user?.name ?? "Ukjent lag"
}

type AvatarStackProps = {
  members: ContestUserSummary[]
  hiddenMemberCount: number
  className?: string
}

function AvatarStack({ members, hiddenMemberCount, className }: AvatarStackProps) {
  const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS)
  const placeholderCount = Math.min(hiddenMemberCount, MAX_VISIBLE_AVATARS)
  const overflowCount =
    members.length > 0 ? members.length - visibleMembers.length : hiddenMemberCount - placeholderCount

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleMembers.map((member) => (
        <Avatar key={member.id} size="sm" className="ring-2 ring-white">
          <AvatarImage src={member.imageUrl ?? undefined} alt={member.name ?? member.username} />
          <AvatarFallback>
            <IconUser aria-hidden className="size-3" />
          </AvatarFallback>
        </Avatar>
      ))}

      {members.length === 0 &&
        Array.from({ length: placeholderCount }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
          <Avatar key={index} size="sm" className="ring-2 ring-white">
            <AvatarFallback>
              <IconUser aria-hidden className="size-3" />
            </AvatarFallback>
          </Avatar>
        ))}

      {overflowCount > 0 && (
        <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground ring-2 ring-white">
          +{overflowCount}
        </span>
      )}
    </div>
  )
}

const podiumAccentClassNames: Record<number, string> = {
  1: "bg-yellow-100/80 ring-yellow-500/50",
  2: "bg-gray-100/80 ring-gray-400/50",
  3: "bg-orange-100/80 ring-orange-600/40",
}

const podiumOrderClassNames: Record<number, string> = {
  1: "order-1 sm:order-2 sm:-translate-y-3",
  2: "order-2 sm:order-1",
  3: "order-3",
}

type PodiumCardProps = {
  rankedContestant: RankedContestant
  onSelect: (rankedContestant: RankedContestant) => void
}

function PodiumCard({ rankedContestant, onSelect }: PodiumCardProps) {
  const { contestant, rank } = rankedContestant
  const memberCount = contestant.team?.memberCount ?? contestant.participantCount

  return (
    <button
      type="button"
      onClick={() => onSelect(rankedContestant)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl p-4 ring-1 backdrop-blur-2xl transition-transform hover:scale-[1.02]",
        podiumAccentClassNames[rank],
        podiumOrderClassNames[rank]
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full font-bold text-sm text-white",
          rank === 1 && "bg-yellow-500",
          rank === 2 && "bg-gray-400",
          rank === 3 && "bg-orange-600"
        )}
      >
        {rank}
      </span>

      <Text className="font-semibold text-center wrap-break-word">{getTeamName(contestant)}</Text>

      <AvatarStack members={contestant.team?.members ?? []} hiddenMemberCount={memberCount} />

      <Text className="text-sm text-muted-foreground">{contestant.resultValue ?? 0} poeng</Text>
    </button>
  )
}

type LeaderboardRowProps = {
  rankedContestant: RankedContestant
  onSelect: (rankedContestant: RankedContestant) => void
}

function LeaderboardRow({ rankedContestant, onSelect }: LeaderboardRowProps) {
  const { contestant, rank } = rankedContestant
  const memberCount = contestant.team?.memberCount ?? contestant.participantCount

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(rankedContestant)}
        className="flex w-full items-center gap-3 rounded-lg bg-white/40 p-3 text-left backdrop-blur-2xl transition-colors hover:bg-white/60"
      >
        <span className="w-7 shrink-0 text-center font-semibold text-muted-foreground tabular-nums">{rank}</span>

        <Text className="min-w-0 flex-1 truncate font-medium">{getTeamName(contestant)}</Text>

        <AvatarStack
          members={contestant.team?.members ?? []}
          hiddenMemberCount={memberCount}
          className="hidden xs:flex"
        />

        <Text className="shrink-0 text-sm text-muted-foreground tabular-nums">{contestant.resultValue ?? 0} p</Text>
      </button>
    </li>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="h-36 animate-pulse rounded-xl bg-white/40" />
        <div className="h-36 animate-pulse rounded-xl bg-white/40" />
        <div className="h-36 animate-pulse rounded-xl bg-white/40" />
      </div>
      <div className="h-14 animate-pulse rounded-lg bg-white/40" />
      <div className="h-14 animate-pulse rounded-lg bg-white/40" />
      <div className="h-14 animate-pulse rounded-lg bg-white/40" />
    </div>
  )
}

export function Leaderboard() {
  const trpc = useTRPC()
  const { user } = useUser()
  const isAuthenticated = user != null

  const [selected, setSelected] = useState<RankedContestant | null>(null)

  const { data, isLoading } = useQuery({
    ...trpc.contest.getWithContestants.queryOptions({ contestId: CONTEST_ID }),
  })

  const rankedContestants = data ? rankContestants(data.contestants, data.contest.resultOrder) : []
  const podium = rankedContestants.slice(0, 3)
  const rest = rankedContestants.slice(3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Title element="h2">Leaderboard</Title>

        {data?.contest.description && <RichText content={data.contest.description} />}

        {!isAuthenticated && (
          <Text className="text-sm text-muted-foreground">Logg inn for å se hvem som er med på lagene.</Text>
        )}
      </div>

      {isLoading && <LeaderboardSkeleton />}

      {!isLoading && rankedContestants.length === 0 && (
        <Text className="text-muted-foreground">Ingen lag er påmeldt ennå.</Text>
      )}

      {podium.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end sm:pt-3">
          {podium.map((rankedContestant) => (
            <PodiumCard
              key={rankedContestant.contestant.id}
              rankedContestant={rankedContestant}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rest.map((rankedContestant) => (
            <LeaderboardRow
              key={rankedContestant.contestant.id}
              rankedContestant={rankedContestant}
              onSelect={setSelected}
            />
          ))}
        </ul>
      )}

      <TeamModal
        contestant={selected?.contestant ?? null}
        rank={selected?.rank ?? null}
        isAuthenticated={isAuthenticated}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
