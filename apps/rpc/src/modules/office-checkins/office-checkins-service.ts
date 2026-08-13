import { createHmac, timingSafeEqual } from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
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
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const LINK_LIFETIME_MILLISECONDS = 10 * 60 * 1000
const LINK_SIGNATURE_PURPOSE = "office-checkin-rfid-link:v1"
const osloDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: OSLO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function getOsloDayOrdinal(date: Date): number {
  const parts = Object.fromEntries(osloDateFormatter.formatToParts(date).map((part) => [part.type, part.value]))
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY_IN_MILLISECONDS
}

function getCurrentStreak(days: Set<number>, today: number): number {
  const latestDay = Math.max(...[...days].filter((day) => day <= today))
  if (latestDay < today - 1) {
    return 0
  }

  let streak = 0
  for (let day = Math.min(latestDay, today); days.has(day); day--) {
    streak++
  }
  return streak
}

function getLeaderboardStats(checkins: OfficeCheckin[], today: number) {
  const entries = new Map<string, { userRfid: string; days: Set<number> }>()

  for (const checkin of checkins) {
    const entry = entries.get(checkin.userRfid) ?? { userRfid: checkin.userRfid, days: new Set<number>() }
    entry.days.add(getOsloDayOrdinal(checkin.time))
    entries.set(checkin.userRfid, entry)
  }

  return [...entries.values()]
    .map(({ userRfid, days }) => ({
      userRfid,
      totalDays: days.size,
      currentStreak: getCurrentStreak(days, today),
    }))
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
      const today = getOsloDayOrdinal(now)
      const leaders = getLeaderboardStats(checkins, today).slice(0, 10)

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
      const leaders = getLeaderboardStats(checkins, getOsloDayOrdinal(now))
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
      const expires = now.getTime() + LINK_LIFETIME_MILLISECONDS
      const url = new URL("/studentnummer/koble", webPublicOrigin)
      url.searchParams.set("userRfid", userRfid)
      url.searchParams.set("expires", expires.toString())
      url.searchParams.set("signature", signLink(secretKey, userRfid, expires))

      return { url: url.toString(), expiresAt: new Date(expires) }
    },

    async linkUser(handle, userId, link, now = new Date()) {
      const expectedSignature = Buffer.from(signLink(secretKey, link.userRfid, link.expires), "hex")
      const suppliedSignature = Buffer.from(link.signature, "hex")

      if (
        link.expires < now.getTime() ||
        suppliedSignature.length !== expectedSignature.length ||
        !timingSafeEqual(suppliedSignature, expectedSignature)
      ) {
        throw new InvalidArgumentError("The student number link is invalid or has expired")
      }

      return PublicUserSchema.parse(await userService.linkRfid(handle, userId, link.userRfid))
    },
  }
}
