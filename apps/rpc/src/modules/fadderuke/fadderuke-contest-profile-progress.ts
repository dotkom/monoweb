import type { DBHandle } from "@dotkomonline/db"
import { z } from "zod"

export const FADDERUKE_CONTEST_YEAR = 2026
export const FADDERUKE_CONTEST_USERNAME_POINTS = 10
export const FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS = 10
export const FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL = 1000

export const FadderukeContestProfilePointsAwardedSchema = z.object({
  pointsAwarded: z.number().int(),
  teamBonusAwarded: z.number().int(),
})
export type FadderukeContestProfilePointsAwarded = z.infer<typeof FadderukeContestProfilePointsAwardedSchema>

export const FadderukeContestProfileProgressStatusSchema = z.object({
  isContestTeamMember: z.boolean(),
  hasSetUsername: z.boolean(),
  hasSetProfilePicture: z.boolean(),
  teamProfileBonusAwarded: z.boolean(),
  usernamePoints: z.number().int(),
  profilePicturePoints: z.number().int(),
  teamBonusTotal: z.number().int(),
})
export type FadderukeContestProfileProgressStatus = z.infer<typeof FadderukeContestProfileProgressStatusSchema>

const NO_POINTS_AWARDED: FadderukeContestProfilePointsAwarded = {
  pointsAwarded: 0,
  teamBonusAwarded: 0,
}

const INACTIVE_CONTEST_PROFILE_PROGRESS_STATUS: FadderukeContestProfileProgressStatus = {
  isContestTeamMember: false,
  hasSetUsername: false,
  hasSetProfilePicture: false,
  teamProfileBonusAwarded: false,
  usernamePoints: FADDERUKE_CONTEST_USERNAME_POINTS,
  profilePicturePoints: FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
  teamBonusTotal: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
}

type ProfileSnapshot = {
  username: string
  imageUrl: string | null
}

export function isDefaultUsername(username: string) {
  return z.guid().safeParse(username).success
}

export const DEFAULT_PROFILE_PICTURE_URL_PREFIX = "https://s.gravatar.com/avatar/"

export function hasProfilePicture(imageUrl: string | null) {
  return imageUrl !== null && !imageUrl.startsWith(DEFAULT_PROFILE_PICTURE_URL_PREFIX)
}

export function calculateFadderukeContestProfileScore(members: ProfileSnapshot[]) {
  let basePoints = 0
  let isTeamComplete = members.length > 0

  for (const member of members) {
    const hasSetUsername = !isDefaultUsername(member.username)
    const hasSetProfilePicture = hasProfilePicture(member.imageUrl)

    basePoints += hasSetUsername ? FADDERUKE_CONTEST_USERNAME_POINTS : 0
    basePoints += hasSetProfilePicture ? FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS : 0
    isTeamComplete = isTeamComplete && hasSetUsername && hasSetProfilePicture
  }

  return {
    basePoints,
    totalPoints: isTeamComplete ? FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL : basePoints,
  }
}

export async function findFadderukeContestId(handle: DBHandle, year: number) {
  const fadderuke = await handle.fadderuke.findUnique({
    where: {
      year,
    },
    select: {
      event: {
        select: {
          contestId: true,
        },
      },
    },
  })

  return fadderuke?.event.contestId ?? null
}

const CONTESTANT_SELECT = {
  id: true,
  resultValue: true,
  fadderukeProfilePointsAwarded: true,
  user: {
    select: {
      id: true,
      username: true,
      imageUrl: true,
    },
  },
  team: {
    select: {
      members: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
        },
      },
    },
  },
} as const

async function findContestantForUser(handle: DBHandle, contestId: string, userId: string) {
  return await handle.contestant.findFirst({
    where: {
      contestId,
      OR: [
        {
          userId,
        },
        {
          team: {
            members: {
              some: {
                id: userId,
              },
            },
          },
        },
      ],
    },
    select: CONTESTANT_SELECT,
  })
}

type ContestantWithMembers = NonNullable<Awaited<ReturnType<typeof findContestantForUser>>>

function getContestantMembers(contestant: ContestantWithMembers) {
  if (contestant.team !== null) {
    return contestant.team.members
  }

  if (contestant.user !== null) {
    return [contestant.user]
  }

  return []
}

/**
 * Brings the contestant's awarded profile points in line with the members' current profiles, adding the difference to
 * the contest score. Points are never taken back, e.g. if a member later removes their profile picture.
 */
async function syncContestantProfilePoints(
  handle: DBHandle,
  contestantId: string
): Promise<FadderukeContestProfilePointsAwarded> {
  // Lock the contestant row so concurrent profile updates cannot award the same points twice
  await handle.$queryRaw`
    SELECT "id"
    FROM "contestant"
    WHERE "id" = ${contestantId}
    FOR UPDATE
  `

  const contestant = await handle.contestant.findUnique({
    where: {
      id: contestantId,
    },
    select: CONTESTANT_SELECT,
  })

  if (contestant === null) {
    return NO_POINTS_AWARDED
  }

  const { basePoints, totalPoints } = calculateFadderukeContestProfileScore(getContestantMembers(contestant))
  const pointsToAward = totalPoints - contestant.fadderukeProfilePointsAwarded

  if (pointsToAward <= 0) {
    return NO_POINTS_AWARDED
  }

  await handle.contestant.update({
    where: {
      id: contestantId,
    },
    data: {
      fadderukeProfilePointsAwarded: {
        increment: pointsToAward,
      },
      resultValue: (contestant.resultValue ?? 0) + pointsToAward,
    },
  })

  const pointsAwarded = Math.min(pointsToAward, Math.max(0, basePoints - contestant.fadderukeProfilePointsAwarded))

  return {
    pointsAwarded,
    teamBonusAwarded: pointsToAward - pointsAwarded,
  }
}

export async function awardFadderukeContestProfilePointsOnUserUpdate(
  handle: DBHandle,
  userId: string,
  updateData: Partial<ProfileSnapshot>
): Promise<FadderukeContestProfilePointsAwarded> {
  if (updateData.username === undefined && updateData.imageUrl === undefined) {
    return NO_POINTS_AWARDED
  }

  const contestId = await findFadderukeContestId(handle, FADDERUKE_CONTEST_YEAR)

  if (contestId === null) {
    return NO_POINTS_AWARDED
  }

  const contestant = await findContestantForUser(handle, contestId, userId)

  if (contestant === null) {
    return NO_POINTS_AWARDED
  }

  return await syncContestantProfilePoints(handle, contestant.id)
}

export async function awardFadderukeContestProfilePointsForContestMembers(
  handle: DBHandle,
  contestId: string,
  userIds: string[]
) {
  const fadderukeContestId = await findFadderukeContestId(handle, FADDERUKE_CONTEST_YEAR)

  if (fadderukeContestId === null || fadderukeContestId !== contestId) {
    return
  }

  const syncedContestantIds = new Set<string>()

  for (const userId of userIds) {
    const contestant = await findContestantForUser(handle, contestId, userId)

    if (contestant === null || syncedContestantIds.has(contestant.id)) {
      continue
    }

    syncedContestantIds.add(contestant.id)
    await syncContestantProfilePoints(handle, contestant.id)
  }
}

export async function getFadderukeContestProfileProgressStatusForUser(handle: DBHandle, userId: string) {
  const contestId = await findFadderukeContestId(handle, FADDERUKE_CONTEST_YEAR)

  if (contestId === null) {
    return INACTIVE_CONTEST_PROFILE_PROGRESS_STATUS
  }

  const contestant = await findContestantForUser(handle, contestId, userId)

  if (contestant === null || contestant.team === null) {
    return INACTIVE_CONTEST_PROFILE_PROGRESS_STATUS
  }

  const member = contestant.team.members.find((teamMember) => teamMember.id === userId)

  if (member === undefined) {
    return INACTIVE_CONTEST_PROFILE_PROGRESS_STATUS
  }

  return {
    isContestTeamMember: true,
    hasSetUsername: !isDefaultUsername(member.username),
    hasSetProfilePicture: hasProfilePicture(member.imageUrl),
    teamProfileBonusAwarded: contestant.fadderukeProfilePointsAwarded >= FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
    usernamePoints: FADDERUKE_CONTEST_USERNAME_POINTS,
    profilePicturePoints: FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
    teamBonusTotal: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
  }
}
