import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type {
  Mark,
  MarkId,
  PersonalMark,
  PersonalMarkDetails,
  Punishment,
  UserId,
  VisiblePersonalMarkDetails,
} from "@dotkomonline/types"
import { getPunishmentExpiryDate } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import { NotFoundError } from "../../error"
import type { EmailService } from "../email/email-service"
import { DEFAULT_EMAIL_SOURCE, emails } from "../email/email-template"
import type { UserService } from "../user/user-service"
import type { MarkService } from "./mark-service"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  findPersonalMarksByMark(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  findPersonalMarkDetails(handle: DBHandle, markId: MarkId): Promise<PersonalMarkDetails[]>
  findMarksByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  findPersonalMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addToUser(handle: DBHandle, userId: UserId, markId: MarkId, givenById?: UserId): Promise<PersonalMark>
  /**
   * Remove a personal mark from a user
   *
   * @throws {NotFoundError} if the personal mark does not exist
   */
  removeFromUser(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  listVisibleInformationForUser(handle: DBHandle, userId: UserId): Promise<VisiblePersonalMarkDetails[]>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
  findPunishmentByUserId(handle: DBHandle, userId: UserId): Promise<Punishment | null>
  sendReceivedMarkEmail(handle: DBHandle, personalMark: PersonalMark): Promise<void>
}

export function getPersonalMarkService(
  personalMarkRepository: PersonalMarkRepository,
  markService: MarkService,
  userService: UserService,
  emailService: EmailService
): PersonalMarkService {
  const logger = getLogger("personal-mark-service")

  return {
    async findPersonalMarksByMark(handle, markId) {
      return await personalMarkRepository.getByMarkId(handle, markId)
    },
    async findPersonalMarkDetails(handle, markId) {
      return await personalMarkRepository.getDetailsByMarkId(handle, markId)
    },
    async findPersonalMarksByUserId(handle, userId) {
      return await personalMarkRepository.getAllMarksByUserId(handle, userId)
    },
    async findMarksByUserId(handle, userId) {
      return await personalMarkRepository.getAllByUserId(handle, userId)
    },
    async addToUser(handle, userId, markId, givenById) {
      const mark = await markService.getMark(handle, markId)
      const personalMark = await personalMarkRepository.addToUserId(handle, userId, mark.id, givenById)

      await this.sendReceivedMarkEmail(handle, personalMark)

      return personalMark
    },
    async listVisibleInformationForUser(handle, userId) {
      const personalMarks = await personalMarkRepository.getAllByUserId(handle, userId)
      const marks = await markService.findMany(handle, {
        byId: personalMarks.map(({ markId }) => markId),
      })

      return personalMarks.map(({ givenById: _, ...personalMark }): VisiblePersonalMarkDetails => {
        const mark = marks.find((mark) => mark.id === personalMark.markId)

        if (!mark) {
          throw new NotFoundError(`Mark(ID=${personalMark.markId}) not found`)
        }

        return {
          mark,
          personalMark,
        }
      })
    },
    async removeFromUser(handle, userId, markId) {
      const personalMark = await personalMarkRepository.removeFromUserId(handle, userId, markId)
      if (!personalMark) {
        throw new NotFoundError(`PersonalMark(UserID=${userId}, MarkID=${markId}) not found`)
      }
      return personalMark
    },
    async countUsersByMarkId(handle, markId) {
      return await personalMarkRepository.countUsersByMarkId(handle, markId)
    },
    async findPunishmentByUserId(handle, userId) {
      const personalMarks = await personalMarkRepository.getAllByUserId(handle, userId)
      const marks = await markService.findMany(handle, {
        byId: personalMarks.map((pm) => pm.markId),
      })

      const currentMarkWeight = personalMarks.reduce((acc, pm) => {
        const mark = marks.find((m) => m.id === pm.markId)

        if (!mark) return acc
        if (isPast(getPunishmentExpiryDate(pm.createdAt, mark.duration))) return acc

        return acc + mark.weight
      }, 0)

      if (currentMarkWeight >= 6) {
        return { delay: 0, suspended: true }
      }

      if (currentMarkWeight >= 3) {
        return { delay: 24, suspended: false }
      }

      if (currentMarkWeight === 2) {
        return { delay: 4, suspended: false }
      }

      if (currentMarkWeight === 1) {
        return { delay: 1, suspended: false }
      }

      return null
    },
    async sendReceivedMarkEmail(handle, personalMark) {
      const user = await userService.getById(handle, personalMark.userId)
      if (!user) {
        throw new NotFoundError(`User(ID=${personalMark.userId}) not found`)
      }

      if (!user.email) {
        logger.warn(`User(ID=${user.id}) does not have an email, cannot send received mark email`)
        return
      }

      const mark = await markService.getMark(handle, personalMark.markId)

      const organizerEmails = mark.groups.map((g) => g.email).filter((email) => email !== null)

      await emailService.send(
        DEFAULT_EMAIL_SOURCE,
        organizerEmails,
        [user.email],
        [],
        [],
        "Du har fått en prikk",
        emails.RECEIVED_MARK,
        {
          title: mark.title,
          details: mark.details,
          weight: mark.weight,
          endsAt: getPunishmentExpiryDate(personalMark.createdAt, mark.duration).toISOString(),
        }
      )
    },
  }
}
