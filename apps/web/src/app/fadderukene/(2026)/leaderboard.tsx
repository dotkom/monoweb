"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"
import type { ContestId, ContestResultOrder, ContestUserSummary, ContestantDetail } from "@dotkomonline/rpc/contest"
import { Avatar, AvatarFallback, AvatarImage, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { IconUserFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { TeamModal } from "./team-modal"
import Image from "next/image"

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
  userId: string | null
  small?: boolean
  className?: string
}

function AvatarStack({ members, hiddenMemberCount, userId, small = false, className }: AvatarStackProps) {
  const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS)
  const placeholderCount = Math.min(hiddenMemberCount, MAX_VISIBLE_AVATARS)
  const overflowCount =
    members.length > 0 ? members.length - visibleMembers.length : hiddenMemberCount - placeholderCount

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleMembers.map((member) => (
        <Avatar
          key={member.id}
          size={small ? "sm" : "default"}
          className={cn(
            "ring-2 ring-white/40 dark:ring-black/25",
            member.id === userId && "ring-blue-300 dark:ring-blue-600/50"
          )}
        >
          <AvatarImage src={member.imageUrl ?? undefined} alt={member.name ?? member.username} />
          <AvatarFallback>
            <IconUserFilled className="size-3.5" />
          </AvatarFallback>
        </Avatar>
      ))}

      {members.length === 0 &&
        Array.from({ length: placeholderCount }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
          <Avatar key={index} size={small ? "sm" : "default"} className="ring-2 ring-white dark:ring-black/25">
            <AvatarFallback>
              <IconUserFilled className="size-3.5" />
            </AvatarFallback>
          </Avatar>
        ))}

      {overflowCount > 0 && (
        <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground ring-2 ring-white dark:ring-black/25">
          +{overflowCount}
        </span>
      )}
    </div>
  )
}

type PodiumCardProps = {
  className?: string
  rankedContestant: RankedContestant
  userId: string | null
  onSelect: (rankedContestant: RankedContestant) => void
}

function PodiumCard({ className, rankedContestant, userId, onSelect }: PodiumCardProps) {
  const { contestant, rank } = rankedContestant
  const memberCount = contestant.team?.memberCount ?? contestant.participantCount
  const isContestant = userId === contestant.user?.id || contestant.team?.members.some((member) => member.id === userId)

  let image = "/fadderuke-2026-podium-1.svg"
  if (rank === 2) {
    image = "/fadderuke-2026-podium-2.svg"
  } else if (rank === 3) {
    image = "/fadderuke-2026-podium-3.svg"
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(rankedContestant)}
      className={cn(
        "mt-3 flex flex-col gap-3 items-center p-2 hover:bg-white/40 dark:hover:bg-white/8 rounded-lg transition-all hover:scale-[1.02]",
        rank === 1 && "pt-4",
        className
      )}
    >
      <Image
        src={image}
        alt={getTeamName(contestant)}
        width={180}
        height={180}
        className={cn("p-1", rank === 1 && "sm:scale-120")}
      />

      <Text
        element="span"
        className={cn(
          "w-full min-w-0 font-semibold tracking-wide text-lg text-center line-clamp-2 wrap-break-word font-marcellus",
          isContestant && "rounded-md bg-blue-200/50 dark:bg-blue-800/22",
          rank === 1 && "sm:text-2xl"
        )}
      >
        {getTeamName(contestant)}
      </Text>

      <Text element="span" className={cn("text-sm w-fit", rank === 1 && "sm:text-base")}>
        <span className="font-semibold">{contestant.resultValue ?? 0}</span> poeng
      </Text>

      <AvatarStack members={contestant.team?.members ?? []} hiddenMemberCount={memberCount} userId={userId} />
    </button>
  )
}

type LeaderboardRowProps = {
  rankedContestant: RankedContestant
  onSelect: (rankedContestant: RankedContestant) => void
  userId: string | null
}

const leaderboardListClassName = "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-3 gap-y-2"
const leaderboardRowClassName = "col-span-full grid grid-cols-subgrid"

function LeaderboardRow({ rankedContestant, onSelect, userId }: LeaderboardRowProps) {
  const { contestant, rank } = rankedContestant
  const memberCount = contestant.team?.memberCount ?? contestant.participantCount

  const isContestant = userId === contestant.user?.id || contestant.team?.members.some((member) => member.id === userId)

  return (
    <li className={leaderboardRowClassName}>
      <button
        type="button"
        onClick={() => onSelect(rankedContestant)}
        className={cn(
          "col-span-full grid grid-cols-subgrid w-full items-baseline gap-x-3 rounded-lg p-3 text-left backdrop-blur-2xl transition-colors",
          "bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/12",
          isContestant && "bg-blue-200/50 hover:bg-blue-200/85 dark:bg-blue-800/22 dark:hover:bg-blue-800/35"
        )}
      >
        <Text
          element="span"
          className={cn(
            "min-w-4 text-right text-[#5E4417] dark:text-muted-foreground font-medium font-mono",
            isContestant && "text-blue-900/75 dark:text-blue-100/50"
          )}
        >
          {rank}
        </Text>

        <Text element="span" className="min-w-0 truncate font-marcellus font-medium">
          {getTeamName(contestant)}
        </Text>

        <AvatarStack
          members={contestant.team?.members ?? []}
          hiddenMemberCount={memberCount}
          userId={userId}
          small
          className="ml-auto self-center hidden xs:flex"
        />

        <Text className="text-right text-sm tabular-nums" element="span">
          {contestant.resultValue ?? 0} <span className="sm:hidden">p</span>
          <span className="max-sm:hidden">poeng</span>
        </Text>
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

type LeaderboardProps = {
  contestId: ContestId
}

export function Leaderboard({ contestId }: LeaderboardProps) {
  const trpc = useTRPC()
  const { user } = useUser()
  const isAuthenticated = user != null

  const [selected, setSelected] = useState<RankedContestant | null>(null)

  const { data, isLoading } = useQuery({
    ...trpc.contest.getWithContestants.queryOptions({ contestId }),
  })

  const rankedContestants = data ? rankContestants(data.contestants, data.contest.resultOrder) : []
  const [first, second, third] = rankedContestants.slice(0, 3)
  const rest = rankedContestants.slice(3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/fadderuke-2026-torch.svg"
            aria-hidden
            alt=""
            width={180}
            height={180}
            draggable={false}
            className="h-12 w-8 object-cover shrink-0 inline-block select-none"
          />
          <Title element="h2" className="font-marcellus">
            Onlinelekenes pall
          </Title>
        </div>

        {data?.contest.description && <RichText content={data.contest.description} />}

        {!isAuthenticated && (
          <Text className="text-sm text-muted-foreground">Logg inn for å se hvem som er med på lagene.</Text>
        )}
      </div>

      {isLoading && <LeaderboardSkeleton />}

      {!isLoading && rankedContestants.length === 0 && (
        <Text className="text-muted-foreground">Ingen lag er påmeldt ennå.</Text>
      )}

      {first !== undefined && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end sm:pt-3">
          <PodiumCard
            key={`${first.contestant.id}-sm`}
            rankedContestant={first}
            userId={user?.sub ?? null}
            onSelect={setSelected}
            className="sm:hidden"
          />

          {second !== undefined && (
            <PodiumCard
              key={second.contestant.id}
              rankedContestant={second}
              userId={user?.sub ?? null}
              onSelect={setSelected}
            />
          )}

          <PodiumCard
            key={`${first.contestant.id}-lg`}
            rankedContestant={first}
            userId={user?.sub ?? null}
            onSelect={setSelected}
            className="max-sm:hidden"
          />

          {third !== undefined && (
            <PodiumCard
              key={third.contestant.id}
              rankedContestant={third}
              userId={user?.sub ?? null}
              onSelect={setSelected}
            />
          )}
        </div>
      )}

      {rest.length > 0 && (
        <ul className={leaderboardListClassName}>
          {rest.map((rankedContestant) => (
            <LeaderboardRow
              key={rankedContestant.contestant.id}
              rankedContestant={rankedContestant}
              onSelect={setSelected}
              userId={user?.sub ?? null}
            />
          ))}
        </ul>
      )}

      <TeamModal
        contestant={selected?.contestant ?? null}
        rank={selected?.rank ?? null}
        userId={user?.sub ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
