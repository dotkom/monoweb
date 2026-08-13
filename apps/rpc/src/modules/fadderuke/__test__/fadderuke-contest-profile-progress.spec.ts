import type { DBHandle } from "@dotkomonline/db"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  awardFadderukeContestProfilePointsForContestMembers,
  awardFadderukeContestProfilePointsOnUserUpdate,
  calculateFadderukeContestProfileScore,
  FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS,
  FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
  FADDERUKE_CONTEST_USERNAME_POINTS,
  FADDERUKE_CONTEST_YEAR,
  hasProfilePicture,
  isDefaultUsername,
} from "../fadderuke-contest-profile-progress"

const FADDERUKE_CONTEST_ID = "e368a124-4394-40ea-8354-928a97902e51"
const DEFAULT_USERNAME = "550e8400-e29b-41d4-a716-446655440000"
const USER_ID = "auth0|contest-user"
const TEAMMATE_ID = "auth0|contest-teammate"

const MEMBER_POINTS = FADDERUKE_CONTEST_USERNAME_POINTS + FADDERUKE_CONTEST_PROFILE_PICTURE_POINTS

const COMPLETE_PROFILE = {
  username: "brage",
  imageUrl: "https://example.com/avatar.png",
}
const EMPTY_PROFILE = {
  username: DEFAULT_USERNAME,
  imageUrl: null,
}

function createHandle() {
  return mockDeep<DBHandle>()
}

function mockContest(handle: DeepMockProxy<DBHandle>) {
  handle.fadderuke.findUnique.mockResolvedValue({
    event: {
      contestId: FADDERUKE_CONTEST_ID,
    },
  } as never)
}

type MockContestant = {
  id: string
  resultValue: number | null
  fadderukeProfilePointsAwarded: number
  user: { id: string; username: string; imageUrl: string | null } | null
  team: { members: Array<{ id: string; username: string; imageUrl: string | null }> } | null
}

function mockContestant(handle: DeepMockProxy<DBHandle>, contestant: MockContestant) {
  handle.contestant.findFirst.mockResolvedValue(contestant as never)
  handle.contestant.findUnique.mockResolvedValue(contestant as never)
}

describe("fadderuke contest profile progress", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("treats uuid usernames as unset and non-uuid usernames as set", () => {
    expect(isDefaultUsername(DEFAULT_USERNAME)).toBe(true)
    expect(isDefaultUsername("brage")).toBe(false)
  })

  it("treats gravatar and auth0 default avatars as unset profile pictures", () => {
    expect(hasProfilePicture(null)).toBe(false)
    expect(hasProfilePicture("https://s.gravatar.com/avatar/abc123")).toBe(false)
    expect(hasProfilePicture("https://cdn.auth0.com/avatars/br.png")).toBe(false)
    expect(hasProfilePicture("https://example.com/avatar.png")).toBe(true)
  })

  it("scores partial teams by their individual profile completions", () => {
    expect(
      calculateFadderukeContestProfileScore([COMPLETE_PROFILE, { username: "teammate", imageUrl: null }, EMPTY_PROFILE])
    ).toEqual({
      basePoints: MEMBER_POINTS + FADDERUKE_CONTEST_USERNAME_POINTS,
      totalPoints: MEMBER_POINTS + FADDERUKE_CONTEST_USERNAME_POINTS,
    })
  })

  it("tops complete teams up to exactly the bonus total regardless of size", () => {
    for (const memberCount of [1, 2, 5]) {
      const members = Array.from({ length: memberCount }, () => COMPLETE_PROFILE)

      expect(calculateFadderukeContestProfileScore(members)).toEqual({
        basePoints: MEMBER_POINTS * memberCount,
        totalPoints: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
      })
    }
  })

  it("gives no points and no bonus to contestants without members", () => {
    expect(calculateFadderukeContestProfileScore([])).toEqual({
      basePoints: 0,
      totalPoints: 0,
    })
  })

  it("awards a member their own profile points while the team is incomplete", async () => {
    const handle = createHandle()

    mockContest(handle)
    mockContestant(handle, {
      id: "contestant-id",
      resultValue: 420,
      fadderukeProfilePointsAwarded: 0,
      user: null,
      team: {
        members: [
          { id: USER_ID, ...COMPLETE_PROFILE },
          { id: TEAMMATE_ID, ...EMPTY_PROFILE },
        ],
      },
    })

    const awarded = await awardFadderukeContestProfilePointsOnUserUpdate(handle, USER_ID, COMPLETE_PROFILE)

    expect(handle.$queryRaw).toHaveBeenCalledOnce()
    expect(handle.contestant.update).toHaveBeenCalledWith({
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: MEMBER_POINTS,
        },
        resultValue: 420 + MEMBER_POINTS,
      },
    })
    expect(awarded).toEqual({
      pointsAwarded: MEMBER_POINTS,
      teamBonusAwarded: 0,
    })
  })

  it("tops the team up to exactly the bonus total when the last member completes their profile", async () => {
    const handle = createHandle()

    mockContest(handle)
    mockContestant(handle, {
      id: "contestant-id",
      resultValue: 420 + MEMBER_POINTS,
      fadderukeProfilePointsAwarded: MEMBER_POINTS,
      user: null,
      team: {
        members: [
          { id: USER_ID, ...COMPLETE_PROFILE },
          { id: TEAMMATE_ID, username: "teammate", imageUrl: "https://example.com/teammate.png" },
        ],
      },
    })

    const awarded = await awardFadderukeContestProfilePointsOnUserUpdate(handle, TEAMMATE_ID, {
      imageUrl: "https://example.com/teammate.png",
    })

    expect(handle.contestant.update).toHaveBeenCalledWith({
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL - MEMBER_POINTS,
        },
        resultValue: 420 + FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
      },
    })
    expect(awarded).toEqual({
      pointsAwarded: MEMBER_POINTS,
      teamBonusAwarded: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL - MEMBER_POINTS * 2,
    })
  })

  it("initializes a null contest score instead of incrementing it", async () => {
    const handle = createHandle()

    mockContest(handle)
    mockContestant(handle, {
      id: "contestant-id",
      resultValue: null,
      fadderukeProfilePointsAwarded: 0,
      user: null,
      team: {
        members: [
          { id: USER_ID, username: "brage", imageUrl: null },
          { id: TEAMMATE_ID, ...EMPTY_PROFILE },
        ],
      },
    })

    await awardFadderukeContestProfilePointsOnUserUpdate(handle, USER_ID, { username: "brage" })

    expect(handle.contestant.update).toHaveBeenCalledWith({
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: FADDERUKE_CONTEST_USERNAME_POINTS,
        },
        resultValue: FADDERUKE_CONTEST_USERNAME_POINTS,
      },
    })
  })

  it("does not award points twice for already awarded progress", async () => {
    const handle = createHandle()

    mockContest(handle)
    mockContestant(handle, {
      id: "contestant-id",
      resultValue: 1420,
      fadderukeProfilePointsAwarded: FADDERUKE_CONTEST_TEAM_PROFILE_BONUS_TOTAL,
      user: null,
      team: {
        members: [
          { id: USER_ID, ...COMPLETE_PROFILE },
          { id: TEAMMATE_ID, username: "teammate", imageUrl: "https://example.com/teammate.png" },
        ],
      },
    })

    const awarded = await awardFadderukeContestProfilePointsOnUserUpdate(handle, USER_ID, COMPLETE_PROFILE)

    expect(handle.contestant.update).not.toHaveBeenCalled()
    expect(awarded).toEqual({
      pointsAwarded: 0,
      teamBonusAwarded: 0,
    })
  })

  it("does nothing when the update does not touch profile fields", async () => {
    const handle = createHandle()

    await awardFadderukeContestProfilePointsOnUserUpdate(handle, USER_ID, {})

    expect(handle.fadderuke.findUnique).not.toHaveBeenCalled()
    expect(handle.contestant.findFirst).not.toHaveBeenCalled()
  })

  it("does nothing when the fadderuke contest is missing", async () => {
    const handle = createHandle()

    handle.fadderuke.findUnique.mockResolvedValue(null)

    await awardFadderukeContestProfilePointsOnUserUpdate(handle, USER_ID, { username: "brage" })

    expect(handle.contestant.findFirst).not.toHaveBeenCalled()
    expect(handle.contestant.update).not.toHaveBeenCalled()
  })

  it("awards points for existing profiles when members join the contest", async () => {
    const handle = createHandle()

    mockContest(handle)
    mockContestant(handle, {
      id: "contestant-id",
      resultValue: null,
      fadderukeProfilePointsAwarded: 0,
      user: null,
      team: {
        members: [
          { id: USER_ID, ...COMPLETE_PROFILE },
          { id: TEAMMATE_ID, ...EMPTY_PROFILE },
        ],
      },
    })

    await awardFadderukeContestProfilePointsForContestMembers(handle, FADDERUKE_CONTEST_ID, [USER_ID, TEAMMATE_ID])

    // Both members resolve to the same contestant, which is only synced once
    expect(handle.$queryRaw).toHaveBeenCalledOnce()
    expect(handle.contestant.update).toHaveBeenCalledExactlyOnceWith({
      where: { id: "contestant-id" },
      data: {
        fadderukeProfilePointsAwarded: {
          increment: MEMBER_POINTS,
        },
        resultValue: MEMBER_POINTS,
      },
    })
  })

  it("ignores contests other than the fadderuke contest", async () => {
    const handle = createHandle()

    mockContest(handle)

    await awardFadderukeContestProfilePointsForContestMembers(handle, "some-other-contest-id", [USER_ID])

    expect(handle.contestant.findFirst).not.toHaveBeenCalled()
  })

  it("uses the configured fadderuke year when resolving the contest", () => {
    expect(FADDERUKE_CONTEST_YEAR).toBe(2026)
  })
})
