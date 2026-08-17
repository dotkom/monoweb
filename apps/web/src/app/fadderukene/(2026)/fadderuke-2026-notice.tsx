import { server } from "@/utils/trpc/server"
import type { ContestantDetail, ContestResultOrder } from "@dotkomonline/rpc/contest"
import { cookies } from "next/headers"
import { Fadderuke2026NoticeBanner, type NoticeContestantSlot } from "./fadderuke-2026-notice-banner"

const COOKIE_NAME = "Fadderuke2026BannerHidden"

export async function Fadderuke2026Notice() {
  const cookieStore = await cookies()
  const hidden = cookieStore.get(COOKIE_NAME)?.value === "1"

  const contestantSlots = await fetchNoticeContestantSlots()

  return <Fadderuke2026NoticeBanner contestantSlots={contestantSlots} isInitiallyHidden={hidden} />
}

function rankContestants(contestants: ContestantDetail[], order: ContestResultOrder) {
  return contestants
    .filter((contestant): contestant is ContestantDetail & { resultValue: number } => contestant.resultValue !== null)
    .toSorted((left, right) => {
      if (order === "ASC") {
        return left.resultValue - right.resultValue
      }

      return right.resultValue - left.resultValue
    })
    .map((contestant, index) => ({ contestant, rank: index + 1 }))
}

function isUserOnContestant(contestant: ContestantDetail, userId: string) {
  if (contestant.userId === userId) {
    return true
  }

  return contestant.team?.members.some((member) => member.id === userId) ?? false
}

function getNoticeContestantSlots(
  contestants: ContestantDetail[],
  order: ContestResultOrder,
  userId: string | null
): NoticeContestantSlot[] {
  const rankedContestants = rankContestants(contestants, order)

  if (rankedContestants.length === 0) {
    return []
  }

  const yourTeam =
    userId === null ? undefined : rankedContestants.find((ranked) => isUserOnContestant(ranked.contestant, userId))

  const topThree = rankedContestants.slice(0, 3)
  const yourTeamIsOutsideTopThree =
    yourTeam !== undefined && !topThree.some((ranked) => ranked.contestant.id === yourTeam.contestant.id)

  const visible = yourTeamIsOutsideTopThree
    ? [rankedContestants[0], rankedContestants[1], yourTeam].filter(
        (ranked): ranked is NonNullable<typeof ranked> => ranked !== undefined
      )
    : topThree

  const narrowHiddenIndex = yourTeamIsOutsideTopThree ? 1 : 2

  return visible.map((ranked, index) => ({
    contestant: ranked.contestant,
    rank: ranked.rank,
    isYourTeam: yourTeam?.contestant.id === ranked.contestant.id,
    hideOnNarrow: visible.length === 3 && index === narrowHiddenIndex,
  }))
}

async function fetchNoticeContestantSlots(): Promise<NoticeContestantSlot[]> {
  const fadderuke = await server.fadderuke.findByYear.query(2026).catch(() => null)

  if (fadderuke === null) {
    return []
  }

  const parentEvent = await server.event.find.query(fadderuke.eventId)

  if (parentEvent === null || parentEvent.event.contestId === null) {
    return []
  }

  const [{ contest, contestants }, user] = await Promise.all([
    server.contest.getWithContestants.query({
      contestId: parentEvent.event.contestId,
    }),
    server.user.findMe.query().catch(() => null),
  ])

  return getNoticeContestantSlots(contestants, contest.resultOrder, user?.id ?? null)
}
