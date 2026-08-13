import type { DBHandle } from "@dotkomonline/db"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  calculateFadderukeContestProfilePointsGiven,
  calculateFadderukeContestTeamProfileBonus,
  FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
  FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
  FADDERUKE_CONTEST_USERNAME_POINTS,
  FADDERUKE_CONTEST_YEAR,
  getProfileProgressFromSnapshot,
  hasProfilePicture,
  isDefaultUsername,
  isFadderukeContestTeamProfileComplete,
  recordFadderukeContestProfileProgressOnUserUpdate,
  seedFadderukeContestProfileProgressForContestMembers,
} from "../fadderuke-contest-profile-progress"

const FADDERUKE_CONTEST_ID = "e368a124-4394-40ea-8354-928a97902e51"
const DEFAULT_USERNAME = "550e8400-e29b-41d4-a716-446655440000"
const USER_ID = "auth0|contest-user"

function createHandle() {
  return mockDeep<DBHandle>()
}

function mockSoloContestant(handle: DeepMockProxy<DBHandle>, resultValue = 420) {
  handle.contestant.findFirst.mockResolvedValue({
    id: "contestant-id",
    resultValue,
    fadderukeProfilePointsAwarded: 0,
    hasAwardedFadderukeProfileTeamBonus: false,
    userId: USER_ID,
    team: null,
  } as never)
  handle.contestant.findUnique.mockResolvedValue({
    fadderukeProfilePointsAwarded: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
    hasAwardedFadderukeProfileTeamBonus: false,
  } as never)
  handle.contestant.updateMany.mockResolvedValue({
    count: 0,
  })
}

describe("fadderuke contest profile progress", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("treats uuid usernames as unset and non-uuid usernames as set", () => {
    expect(isDefaultUsername(DEFAULT_USERNAME)).toBe(true)
    expect(isDefaultUsername("brage")).toBe(false)
  })

  it("derives progress flags from the current profile snapshot", () => {
    expect(
      getProfileProgressFromSnapshot({
        username: DEFAULT_USERNAME,
        imageUrl: null,
      })
    ).toEqual({
      hasSetUsername: false,
      hasSetProfilePicture: false,
    })

    expect(
      getProfileProgressFromSnapshot({
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      })
    ).toEqual({
      hasSetUsername: true,
      hasSetProfilePicture: true,
    })
  })

  it("treats gravatar default avatars as unset profile pictures", () => {
    expect(hasProfilePicture(null)).toBe(false)
    expect(hasProfilePicture("https://s.gravatar.com/avatar/abc123")).toBe(false)
    expect(hasProfilePicture("https://example.com/avatar.png")).toBe(true)
  })

  it("calculates awarded points and the team bonus from progress rows", () => {
    const progressRows = [
      { hasSetUsername: true, hasSetProfilePicture: true },
      { hasSetUsername: true, hasSetProfilePicture: false },
    ]

    const pointsGiven = calculateFadderukeContestProfilePointsGiven(progressRows)

    expect(pointsGiven).toBe(FADDERUKE_CONTEST_USERNAME_POINTS * 2 + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS)
    expect(calculateFadderukeContestTeamProfileBonus(pointsGiven)).toBe(
      FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL - pointsGiven
    )
    expect(isFadderukeContestTeamProfileComplete(progressRows, 2)).toBe(false)
    expect(
      isFadderukeContestTeamProfileComplete(
        [
          { hasSetUsername: true, hasSetProfilePicture: true },
          { hasSetUsername: true, hasSetProfilePicture: true },
        ],
        2
      )
    ).toBe(true)
  })

  it("records username and profile picture progress when a contest participant updates both", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue({
      eventId: "fadderuke-event-id",
    } as never)
    handle.event.findUnique.mockResolvedValue({
      contestId: FADDERUKE_CONTEST_ID,
    } as never)
    mockSoloContestant(handle)
    handle.fadderukeContestProfileProgress.createMany.mockResolvedValue({
      count: 1,
    })
    handle.fadderukeContestProfileProgress.findUniqueOrThrow.mockResolvedValue({
      id: "progress-id",
      userId: USER_ID,
      hasSetUsername: false,
      hasSetProfilePicture: false,
      createdAt: new Date(),
    } as never)
    handle.fadderukeContestProfileProgress.findMany.mockResolvedValue([
      {
        id: "progress-id",
        userId: USER_ID,
        hasSetUsername: true,
        hasSetProfilePicture: true,
      },
    ] as never)

    await recordFadderukeContestProfileProgressOnUserUpdate(
      handle,
      USER_ID,
      {
        username: DEFAULT_USERNAME,
        imageUrl: null,
      },
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      },
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      }
    )

    expect(handle.fadderukeContestProfileProgress.createMany).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        hasSetUsername: false,
        hasSetProfilePicture: false,
      },
      skipDuplicates: true,
    })
    expect(handle.fadderukeContestProfileProgress.update).toHaveBeenCalledWith({
      where: { id: "progress-id" },
      data: {
        hasSetUsername: true,
        hasSetProfilePicture: true,
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(1, {
      where: { id: "contestant-id" },
      data: {
        resultValue: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
        },
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(2, {
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
        },
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(3, {
      where: { id: "contestant-id" },
      data: {
        resultValue: {
          increment: calculateFadderukeContestTeamProfileBonus(
            FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS
          ),
        },
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(4, {
      where: { id: "contestant-id" },
      data: {
        hasAwardedFadderukeProfileTeamBonus: true,
      },
    })
    expect(handle.$queryRaw).toHaveBeenCalledOnce()
  })

  it("initializes an empty contestant score without a stale read", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue({
      eventId: "fadderuke-event-id",
    } as never)
    handle.event.findUnique.mockResolvedValue({
      contestId: FADDERUKE_CONTEST_ID,
    } as never)
    handle.contestant.findFirst.mockResolvedValue({
      id: "contestant-id",
      resultValue: null,
      fadderukeProfilePointsAwarded: 0,
      hasAwardedFadderukeProfileTeamBonus: false,
      userId: USER_ID,
      team: null,
    } as never)
    handle.contestant.findUnique.mockResolvedValue({
      fadderukeProfilePointsAwarded: FADDERUKE_CONTEST_USERNAME_POINTS,
      hasAwardedFadderukeProfileTeamBonus: false,
    } as never)
    handle.contestant.updateMany.mockResolvedValue({
      count: 1,
    })
    handle.fadderukeContestProfileProgress.createMany.mockResolvedValue({
      count: 1,
    })
    handle.fadderukeContestProfileProgress.findUniqueOrThrow.mockResolvedValue({
      id: "progress-id",
      userId: USER_ID,
      hasSetUsername: false,
      hasSetProfilePicture: false,
      createdAt: new Date(),
    } as never)
    handle.fadderukeContestProfileProgress.findMany.mockResolvedValue([
      {
        id: "progress-id",
        userId: USER_ID,
        hasSetUsername: true,
        hasSetProfilePicture: false,
      },
    ] as never)

    await recordFadderukeContestProfileProgressOnUserUpdate(
      handle,
      USER_ID,
      {
        username: DEFAULT_USERNAME,
        imageUrl: null,
      },
      {
        username: "brage",
        imageUrl: null,
      },
      {
        username: "brage",
      }
    )

    expect(handle.contestant.updateMany).toHaveBeenCalledWith({
      where: {
        id: "contestant-id",
        resultValue: null,
      },
      data: {
        resultValue: FADDERUKE_CONTEST_USERNAME_POINTS,
      },
    })
    expect(handle.contestant.update).toHaveBeenCalledWith({
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS,
        },
      },
    })
  })

  it("awards existing profile points before calculating the team bonus during seeding", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue({
      eventId: "fadderuke-event-id",
    } as never)
    handle.event.findUnique.mockResolvedValue({
      contestId: FADDERUKE_CONTEST_ID,
    } as never)
    mockSoloContestant(handle)
    handle.user.findMany.mockResolvedValue([
      {
        id: USER_ID,
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      },
    ] as never)
    handle.fadderukeContestProfileProgress.createMany.mockResolvedValue({
      count: 1,
    })
    handle.fadderukeContestProfileProgress.findUniqueOrThrow.mockResolvedValue({
      id: "progress-id",
      userId: USER_ID,
      hasSetUsername: true,
      hasSetProfilePicture: true,
      createdAt: new Date(),
    } as never)
    handle.fadderukeContestProfileProgress.findMany.mockResolvedValue([
      {
        id: "progress-id",
        userId: USER_ID,
        hasSetUsername: true,
        hasSetProfilePicture: true,
      },
    ] as never)

    await seedFadderukeContestProfileProgressForContestMembers(handle, FADDERUKE_CONTEST_ID, [USER_ID])

    expect(handle.contestant.update).toHaveBeenNthCalledWith(1, {
      where: { id: "contestant-id" },
      data: {
        resultValue: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
        },
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(2, {
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
        },
      },
    })
    expect(handle.contestant.update).toHaveBeenNthCalledWith(3, {
      where: { id: "contestant-id" },
      data: {
        resultValue: {
          increment: calculateFadderukeContestTeamProfileBonus(
            FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS
          ),
        },
      },
    })
  })

  it("baselines existing profile state without awarding new progress on unrelated updates", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue({
      eventId: "fadderuke-event-id",
    } as never)
    handle.event.findUnique.mockResolvedValue({
      contestId: FADDERUKE_CONTEST_ID,
    } as never)
    mockSoloContestant(handle)

    await recordFadderukeContestProfileProgressOnUserUpdate(
      handle,
      USER_ID,
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      },
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      },
      {
        biography: "Hello",
      } as never
    )

    expect(handle.fadderukeContestProfileProgress.createMany).not.toHaveBeenCalled()
    expect(handle.fadderukeContestProfileProgress.update).not.toHaveBeenCalled()
  })

  it("does nothing when fadderuke contest is missing", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue(null)

    await recordFadderukeContestProfileProgressOnUserUpdate(
      handle,
      USER_ID,
      {
        username: DEFAULT_USERNAME,
        imageUrl: null,
      },
      {
        username: "brage",
        imageUrl: null,
      },
      {
        username: "brage",
      }
    )

    expect(handle.contestant.findFirst).not.toHaveBeenCalled()
    expect(handle.fadderukeContestProfileProgress.createMany).not.toHaveBeenCalled()
    expect(handle.fadderukeContestProfileProgress.update).not.toHaveBeenCalled()
  })

  it("does not award any points after the team bonus has already been given", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue({
      eventId: "fadderuke-event-id",
    } as never)
    handle.event.findUnique.mockResolvedValue({
      contestId: FADDERUKE_CONTEST_ID,
    } as never)
    handle.contestant.findFirst.mockResolvedValue({
      id: "contestant-id",
      resultValue: 920,
      fadderukeProfilePointsAwarded: FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
      hasAwardedFadderukeProfileTeamBonus: true,
      userId: USER_ID,
      team: null,
    } as never)
    handle.fadderukeContestProfileProgress.createMany.mockResolvedValue({
      count: 1,
    })
    handle.fadderukeContestProfileProgress.findUniqueOrThrow.mockResolvedValue({
      id: "progress-id",
      userId: USER_ID,
      hasSetUsername: false,
      hasSetProfilePicture: false,
      createdAt: new Date(),
    } as never)

    await recordFadderukeContestProfileProgressOnUserUpdate(
      handle,
      USER_ID,
      {
        username: DEFAULT_USERNAME,
        imageUrl: null,
      },
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      },
      {
        username: "brage",
        imageUrl: "https://example.com/avatar.png",
      }
    )

    expect(handle.fadderukeContestProfileProgress.update).toHaveBeenCalledWith({
      where: { id: "progress-id" },
      data: {
        hasSetUsername: true,
        hasSetProfilePicture: true,
      },
    })
    expect(handle.contestant.update).not.toHaveBeenCalled()
    expect(handle.$queryRaw).not.toHaveBeenCalled()
  })

  it("uses the configured fadderuke year when resolving the contest", () => {
    expect(FADDERUKE_CONTEST_YEAR).toBe(2026)
  })
})
