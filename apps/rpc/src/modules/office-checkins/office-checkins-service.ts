import { createHmac, timingSafeEqual } from "node:crypto"
import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { addMinutes, compareDesc, differenceInCalendarDays, isAfter, isBefore, startOfDay } from "date-fns"
import type { UserId } from "../user/user"
import { type PublicUser, PublicUserSchema } from "../user/user"
import type { UserService } from "../user/user-service"
import { InvalidArgumentError } from "../../error"
import type {
  OfficeCheckin,
  OfficeCheckinLeaderboardEntry,
  OfficeCheckinLink,
  OfficeCheckinResult,
  PublicOfficeCheckinLeaderboardEntry,
} from "./office-checkin"
import type { OfficeCheckinRepository } from "./office-checkins-repository"

const OSLO_TIME_ZONE = "Europe/Oslo"
const LINK_SIGNATURE_PURPOSE = "office-checkin-rfid-link:v1"

function getLeaderboardStats(checkins: OfficeCheckin[], now: Date) {
  const today = startOfDay(new TZDate(now, OSLO_TIME_ZONE))
  const entries = new Map<string, { userRfid: string; days: Map<number, Date> }>()

  for (const checkin of checkins) {
    const entry = entries.get(checkin.userRfid) ?? { userRfid: checkin.userRfid, days: new Map<number, Date>() }
    const day = startOfDay(new TZDate(checkin.time, OSLO_TIME_ZONE))
    entry.days.set(day.getTime(), day)
    entries.set(checkin.userRfid, entry)
  }

  return [...entries.values()]
    .map(({ userRfid, days }) => {
      const sortedDays = [...days.values()].filter((day) => !isAfter(day, today)).sort(compareDesc)
      const latestDay = sortedDays[0]
      let currentStreak = 0

      if (latestDay && differenceInCalendarDays(today, latestDay) <= 1) {
        for (const [index, day] of sortedDays.entries()) {
          if (differenceInCalendarDays(latestDay, day) !== index) {
            break
          }
          currentStreak++
        }
      }

      return { userRfid, totalDays: days.size, currentStreak }
    })
    .sort((a, b) => b.totalDays - a.totalDays || b.currentStreak - a.currentStreak)
}

function signLink(secretKey: string, userRfid: string, expires: number): string {
  return createHmac("sha256", secretKey).update(`${LINK_SIGNATURE_PURPOSE}\n${userRfid}\n${expires}`).digest("hex")
}

export interface OfficeCheckinsService {
  checkIn(handle: DBHandle, userRfid: string): Promise<OfficeCheckinResult>
  findByUserId(handle: DBHandle, userId: UserId): Promise<OfficeCheckin[]>
  findByUserRfid(handle: DBHandle, userRfid: string): Promise<OfficeCheckin[]>
  getLeaderboard(handle: DBHandle, now?: Date): Promise<OfficeCheckinLeaderboardEntry[]>
  getPublicLeaderboard(handle: DBHandle, now?: Date): Promise<PublicOfficeCheckinLeaderboardEntry[]>
  createLinkUrl(userRfid: string, now?: Date): { url: string; expiresAt: Date }
  linkUser(handle: DBHandle, userId: UserId, link: OfficeCheckinLink, now?: Date): Promise<PublicUser>
}

export function getOfficeCheckinsService(
  officeCheckinRepository: OfficeCheckinRepository,
  userService: UserService,
  secretKey: string,
  webPublicOrigin: string
): OfficeCheckinsService {
  return {
    async checkIn(handle, userRfid) {
      const [checkin, user] = await Promise.all([
        officeCheckinRepository.create(handle, new Date(), userRfid),
        userService.findByRfid(handle, userRfid),
      ])

      return {
        checkin,
        user: user ? PublicUserSchema.parse(user) : null,
      }
    },

    async findByUserId(handle, userId) {
      const user = await userService.findById(handle, userId)
      return user?.userRfid ? await officeCheckinRepository.findByUserRfid(handle, user.userRfid) : []
    },

    async findByUserRfid(handle, userRfid) {
      return await officeCheckinRepository.findByUserRfid(handle, userRfid)
    },

    async getLeaderboard(handle, now = new Date()) {
      const checkins = await officeCheckinRepository.findMany(handle)
      const leaders = getLeaderboardStats(checkins, now).slice(0, 10)

      return await Promise.all(
        leaders.map(async (leader): Promise<OfficeCheckinLeaderboardEntry> => {
          const user = await userService.findByRfid(handle, leader.userRfid)
          const profile: PublicUser | null = user ? PublicUserSchema.parse(user) : null
          return { ...leader, user: profile }
        })
      )
    },

    async getPublicLeaderboard(handle, now = new Date()) {
      const checkins = await officeCheckinRepository.findMany(handle)
      const leaders = getLeaderboardStats(checkins, now)
      const entries = await Promise.all(
        leaders.map(async (leader): Promise<Omit<PublicOfficeCheckinLeaderboardEntry, "rank"> | null> => {
          const user = await userService.findByRfid(handle, leader.userRfid)
          if (!user) {
            return null
          }

          return {
            user: PublicUserSchema.parse(user),
            totalDays: leader.totalDays,
            currentStreak: leader.currentStreak,
          }
        })
      )

      return entries
        .filter((entry): entry is Omit<PublicOfficeCheckinLeaderboardEntry, "rank"> => entry !== null)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
    },

    createLinkUrl(userRfid, now = new Date()) {
      const expiresAt = addMinutes(now, 10)
      const expires = expiresAt.getTime()
      const url = new URL("/studentnummer/koble", webPublicOrigin)
      url.searchParams.set("userRfid", userRfid)
      url.searchParams.set("expires", expires.toString())
      url.searchParams.set("signature", signLink(secretKey, userRfid, expires))

      return { url: url.toString(), expiresAt }
    },

    async linkUser(handle, userId, link, now = new Date()) {
      const expectedSignature = Buffer.from(signLink(secretKey, link.userRfid, link.expires), "hex")
      const suppliedSignature = Buffer.from(link.signature, "hex")

      if (
        isBefore(link.expires, now) ||
        suppliedSignature.length !== expectedSignature.length ||
        !timingSafeEqual(suppliedSignature, expectedSignature)
      ) {
        throw new InvalidArgumentError("The student number link is invalid or has expired")
      }

      return PublicUserSchema.parse(await userService.linkRfid(handle, userId, link.userRfid))
    },
  }
}
