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

type ProfileProgressRow = {
  hasSetUsername: boolean
  hasSetProfilePicture: boolean
}

export function isDefaultUsername(username: string) {
  return z.guid().safeParse(username).success
}

export const DEFAULT_PROFILE_PICTURE_URL_PREFIX = "https://s.gravatar.com/avatar/"

export function hasProfilePicture(imageUrl: string | null) {
  if (imageUrl === null) {
    return false
  }

  return !imageUrl.startsWith(DEFAULT_PROFILE_PICTURE_URL_PREFIX)
}

export function getProfileProgressFromSnapshot(user: ProfileSnapshot) {
  return {
    hasSetUsername: !isDefaultUsername(user.username),
    hasSetProfilePicture: hasProfilePicture(user.imageUrl),
  }
}

export function calculateFadderukeContestProfilePointsGiven(
  progressRows: Array<Pick<ProfileProgressRow, "hasSetUsername" | "hasSetProfilePicture">>
) {
  let pointsGiven = 0

  for (const progressRow of progressRows) {
    if (progressRow.hasSetUsername) {
      pointsGiven += FADDERUKE_CONTEST_USERNAME_POINTS
    }

    if (progressRow.hasSetProfilePicture) {
      pointsGiven += FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS
    }
  }

  return pointsGiven
}

export function calculateFadderukeContestTeamProfileBonus(pointsGiven: number) {
  return Math.max(0, FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL - pointsGiven)
}

export function isFadderukeContestTeamProfileComplete(
  progressRows: Array<Pick<ProfileProgressRow, "hasSetUsername" | "hasSetProfilePicture">>,
  memberCount: number
) {
  if (memberCount === 0 || progressRows.length !== memberCount) {
    return false
  }

  return progressRows.every((progressRow) => progressRow.hasSetUsername && progressRow.hasSetProfilePicture)
}

export async function findFadderukeContestId(handle: DBHandle, year: number) {
  const fadderuke = await handle.fadderuke.findUnique({
    where: {
      year,
    },
    select: {
      eventId: true,
    },
  })

  if (fadderuke === null) {
    return null
  }

  const event = await handle.event.findUnique({
    where: {
      id: fadderuke.eventId,
    },
    select: {
      contestId: true,
    },
  })

  return event?.contestId ?? null
}

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
    select: {
      id: true,
      resultValue: true,
      fadderukeProfilePointsAwarded: true,
      hasAwardedFadderukeProfileTeamBonus: true,
      userId: true,
      team: {
        select: {
          members: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })
}

function getContestantMemberUserIds(contestant: {
  userId: string | null
  team: { members: Array<{ id: string }> } | null
}) {
  if (contestant.team !== null) {
    return contestant.team.members.map((member) => member.id)
  }

  if (contestant.userId !== null) {
    return [contestant.userId]
  }

  return []
}

async function getContestantContextForUser(handle: DBHandle, contestId: string, userId: string) {
  const contestant = await findContestantForUser(handle, contestId, userId)

  if (contestant === null) {
    return null
  }

  const memberUserIds = getContestantMemberUserIds(contestant)

  return {
    contestant,
    memberUserIds,
    teamProfileBonusAwarded: contestant.hasAwardedFadderukeProfileTeamBonus,
  }
}

export async function isUserParticipatingInContest(handle: DBHandle, contestId: string, userId: string) {
  const contestantContext = await getContestantContextForUser(handle, contestId, userId)

  return contestantContext !== null
}

async function awardPointsToContestant(handle: DBHandle, contestantId: string, points: number) {
  if (points === 0) {
    return
  }

  const initializedContestants = await handle.contestant.updateMany({
    where: {
      id: contestantId,
      resultValue: null,
    },
    data: {
      resultValue: points,
    },
  })

  if (initializedContestants.count > 0) {
    return
  }

  await handle.contestant.update({
    where: {
      id: contestantId,
    },
    data: {
      resultValue: {
        increment: points,
      },
    },
  })
}

async function awardProfilePointsToContestant(handle: DBHandle, contestantId: string, points: number) {
  if (points === 0) {
    return
  }

  await awardPointsToContestant(handle, contestantId, points)
  await handle.contestant.update({
    where: {
      id: contestantId,
    },
    data: {
      fadderukeProfilePointsAwarded: {
        increment: points,
      },
    },
  })
}

async function findProfileProgressForUser(handle: DBHandle, userId: string) {
  return await handle.fadderukeContestProfileProgress.findUnique({
    where: {
      userId,
    },
  })
}

export async function baselineFadderukeContestProfileProgress(handle: DBHandle, userId: string, user: ProfileSnapshot) {
  const snapshotProgress = getProfileProgressFromSnapshot(user)
  const createdProgressRows = await handle.fadderukeContestProfileProgress.createMany({
    data: {
      userId,
      ...snapshotProgress,
    },
    skipDuplicates: true,
  })

  const progress = await handle.fadderukeContestProfileProgress.findUniqueOrThrow({
    where: {
      userId,
    },
  })

  let pointsToAwardOnBaseline = 0
  let resolvedProgress = progress

  if (createdProgressRows.count > 0) {
    pointsToAwardOnBaseline = calculateFadderukeContestProfilePointsGiven([snapshotProgress])
  } else {
    const progressUpdates: {
      hasSetUsername?: boolean
      hasSetProfilePicture?: boolean
    } = {}

    if (snapshotProgress.hasSetUsername && !progress.hasSetUsername) {
      progressUpdates.hasSetUsername = true
      pointsToAwardOnBaseline += FADDERUKE_CONTEST_USERNAME_POINTS
    }

    if (snapshotProgress.hasSetProfilePicture && !progress.hasSetProfilePicture) {
      progressUpdates.hasSetProfilePicture = true
      pointsToAwardOnBaseline += FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS
    }

    if (pointsToAwardOnBaseline > 0) {
      resolvedProgress = await handle.fadderukeContestProfileProgress.update({
        where: {
          id: progress.id,
        },
        data: progressUpdates,
      })
    }
  }

  return {
    ...resolvedProgress,
    pointsToAwardOnBaseline,
  }
}

export async function baselineFadderukeContestProfileProgressForUsers(handle: DBHandle, userIds: string[]) {
  if (userIds.length === 0) {
    return []
  }

  const users = await handle.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      username: true,
      imageUrl: true,
    },
  })

  const progressBaselines = []

  for (const user of users) {
    const progressBaseline = await baselineFadderukeContestProfileProgress(handle, user.id, user)
    progressBaselines.push(progressBaseline)
  }

  return progressBaselines
}

async function lockContestantForTeamProfileBonus(handle: DBHandle, contestantId: string) {
  await handle.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "contestant"
    WHERE "id" = ${contestantId}
    FOR UPDATE
  `
}

async function maybeAwardFadderukeContestTeamProfileBonus(
  handle: DBHandle,
  contestId: string,
  userId: string,
  contestantContext?: Awaited<ReturnType<typeof getContestantContextForUser>>
) {
  const resolvedContestantContext = contestantContext ?? (await getContestantContextForUser(handle, contestId, userId))

  if (resolvedContestantContext === null) {
    return 0
  }

  const { contestant, memberUserIds, teamProfileBonusAwarded } = resolvedContestantContext

  if (teamProfileBonusAwarded) {
    return 0
  }

  if (memberUserIds.length === 0) {
    return 0
  }

  await lockContestantForTeamProfileBonus(handle, contestant.id)

  const lockedContestant = await handle.contestant.findUnique({
    where: {
      id: contestant.id,
    },
    select: {
      fadderukeProfilePointsAwarded: true,
      hasAwardedFadderukeProfileTeamBonus: true,
    },
  })

  if (lockedContestant === null || lockedContestant.hasAwardedFadderukeProfileTeamBonus) {
    return 0
  }

  const progressRows = await handle.fadderukeContestProfileProgress.findMany({
    where: {
      userId: {
        in: memberUserIds,
      },
    },
    select: {
      id: true,
      userId: true,
      hasSetUsername: true,
      hasSetProfilePicture: true,
    },
  })

  if (!isFadderukeContestTeamProfileComplete(progressRows, memberUserIds.length)) {
    return 0
  }

  const bonusPoints = calculateFadderukeContestTeamProfileBonus(lockedContestant.fadderukeProfilePointsAwarded)

  await awardPointsToContestant(handle, contestant.id, bonusPoints)

  await handle.contestant.update({
    where: {
      id: contestant.id,
    },
    data: {
      hasAwardedFadderukeProfileTeamBonus: true,
    },
  })

  return bonusPoints
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

  const [progress, user, contestantContext] = await Promise.all([
    findProfileProgressForUser(handle, userId),
    handle.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        imageUrl: true,
      },
    }),
    getContestantContextForUser(handle, contestId, userId),
  ])

  if (user === null) {
    return INACTIVE_CONTEST_PROFILE_PROGRESS_STATUS
  }

  const snapshotProgress = getProfileProgressFromSnapshot(user)

  return {
    isContestTeamMember: true,
    hasSetUsername: (progress?.hasSetUsername ?? false) || snapshotProgress.hasSetUsername,
    hasSetProfilePicture: (progress?.hasSetProfilePicture ?? false) || snapshotProgress.hasSetProfilePicture,
    teamProfileBonusAwarded: contestantContext?.teamProfileBonusAwarded ?? false,
    usernamePoints: FADDERUKE_CONTEST_USERNAME_POINTS,
    profilePicturePoints: FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
    teamBonusTotal: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
  }
}

export async function recordFadderukeContestProfileProgressOnUserUpdate(
  handle: DBHandle,
  userId: string,
  currentUser: ProfileSnapshot,
  updatedUser: ProfileSnapshot,
  updateData: Partial<ProfileSnapshot>
): Promise<FadderukeContestProfilePointsAwarded> {
  const isUpdatingProfileFields = updateData.username !== undefined || updateData.imageUrl !== undefined

  if (!isUpdatingProfileFields) {
    return NO_POINTS_AWARDED
  }

  const contestId = await findFadderukeContestId(handle, FADDERUKE_CONTEST_YEAR)

  if (contestId === null) {
    return NO_POINTS_AWARDED
  }

  const contestantContext = await getContestantContextForUser(handle, contestId, userId)

  if (contestantContext === null) {
    return NO_POINTS_AWARDED
  }

  const progress = await baselineFadderukeContestProfileProgress(handle, userId, currentUser)

  const progressUpdates: {
    hasSetUsername?: boolean
    hasSetProfilePicture?: boolean
  } = {}
  let pointsToAward = 0

  if (!contestantContext.teamProfileBonusAwarded) {
    pointsToAward = progress.pointsToAwardOnBaseline
  }

  if (
    updateData.username !== undefined &&
    isDefaultUsername(currentUser.username) &&
    !isDefaultUsername(updatedUser.username) &&
    !progress.hasSetUsername
  ) {
    progressUpdates.hasSetUsername = true

    if (!contestantContext.teamProfileBonusAwarded) {
      pointsToAward += FADDERUKE_CONTEST_USERNAME_POINTS
    }
  }

  if (
    updateData.imageUrl !== undefined &&
    !hasProfilePicture(currentUser.imageUrl) &&
    hasProfilePicture(updatedUser.imageUrl) &&
    !progress.hasSetProfilePicture
  ) {
    progressUpdates.hasSetProfilePicture = true

    if (!contestantContext.teamProfileBonusAwarded) {
      pointsToAward += FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS
    }
  }

  const hasProgressUpdates =
    progressUpdates.hasSetUsername !== undefined || progressUpdates.hasSetProfilePicture !== undefined

  if (!hasProgressUpdates && pointsToAward === 0) {
    return NO_POINTS_AWARDED
  }

  if (hasProgressUpdates) {
    await handle.fadderukeContestProfileProgress.update({
      where: {
        id: progress.id,
      },
      data: {
        hasSetUsername: progressUpdates.hasSetUsername ?? progress.hasSetUsername,
        hasSetProfilePicture: progressUpdates.hasSetProfilePicture ?? progress.hasSetProfilePicture,
      },
    })
  }

  if (contestantContext.teamProfileBonusAwarded) {
    return NO_POINTS_AWARDED
  }

  if (pointsToAward > 0) {
    await awardProfilePointsToContestant(handle, contestantContext.contestant.id, pointsToAward)
  }

  const teamBonusAwarded = await maybeAwardFadderukeContestTeamProfileBonus(
    handle,
    contestId,
    userId,
    contestantContext
  )

  return {
    pointsAwarded: pointsToAward,
    teamBonusAwarded,
  }
}

export async function seedFadderukeContestProfileProgressForContestMembers(
  handle: DBHandle,
  contestId: string,
  userIds: string[]
) {
  const fadderukeContestId = await findFadderukeContestId(handle, FADDERUKE_CONTEST_YEAR)

  if (fadderukeContestId === null || fadderukeContestId !== contestId) {
    return
  }

  const progressBaselines = await baselineFadderukeContestProfileProgressForUsers(handle, userIds)

  for (const progressBaseline of progressBaselines) {
    if (progressBaseline.pointsToAwardOnBaseline === 0) {
      continue
    }

    const contestantContext = await getContestantContextForUser(handle, contestId, progressBaseline.userId)

    if (contestantContext === null || contestantContext.teamProfileBonusAwarded) {
      continue
    }

    await awardProfilePointsToContestant(
      handle,
      contestantContext.contestant.id,
      progressBaseline.pointsToAwardOnBaseline
    )
  }

  for (const userId of userIds) {
    await maybeAwardFadderukeContestTeamProfileBonus(handle, contestId, userId)
  }
}
