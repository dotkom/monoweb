import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  INDEFINITE_SUSPENSION_DURATION,
  type Mark,
  type MarkId,
  type PersonalMark,
  type PersonalMarkDetails,
  type Punishment,
  SUSPENSION_MARK_WEIGHT,
  type VisiblePersonalMarkDetails,
  formatMarkCount,
} from "./mark"
import type { UserId } from "../user/user"
import { getPunishmentExpiryDate } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import { NotFoundError } from "../../error"
import type { EmailService } from "../email/email-service"
import { DEFAULT_EMAIL_SOURCE, emails, getReplyToAddresses } from "../email/email-template"
import { getGroupDisplayName } from "../group/group"
import type { UserService } from "../user/user-service"
import type { MarkService } from "./mark-service"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  findPersonalMarksByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  findMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  findPersonalMarksByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  addToUser(handle: DBHandle, userId: UserId, markId: MarkId, givenByUserId?: UserId): Promise<PersonalMark>
  /**
   * Remove a personal mark from a user
   *
   * @throws {NotFoundError} if the personal mark does not exist
   */
  removeFromUser(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>

  findPersonalMarkDetails(handle: DBHandle, markId: MarkId): Promise<PersonalMarkDetails[]>
  listVisibleInformationForUser(handle: DBHandle, userId: UserId): Promise<VisiblePersonalMarkDetails[]>

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

  async function findActiveMarks(handle: DBHandle, userId: UserId): Promise<Mark[]> {
    const personalMarks = await personalMarkRepository.findManyByUserId(handle, userId)
    if (personalMarks.length === 0) {
      return []
    }

    const marks = await markService.findMany(
      handle,
      { byId: personalMarks.map((personalMark) => personalMark.markId) },
      { take: personalMarks.length }
    )

    return personalMarks.flatMap((personalMark) => {
      const mark = marks.find((candidate) => candidate.id === personalMark.markId)
      if (!mark || isPast(getPunishmentExpiryDate(personalMark.createdAt, mark.duration))) {
        return []
      }

      return [mark]
    })
  }

  return {
    async findPersonalMarksByMarkId(handle, markId) {
      return await personalMarkRepository.findManyByMarkId(handle, markId)
    },

    async findPersonalMarkDetails(handle, markId) {
      return await personalMarkRepository.findDetailsByMarkId(handle, markId)
    },

    async findPersonalMarksByUserId(handle, userId) {
      return await personalMarkRepository.findManyByUserId(handle, userId)
    },

    async findMarksByUserId(handle, userId) {
      return await personalMarkRepository.findMarksByUserId(handle, userId)
    },

    async addToUser(handle, userId, markId, givenByUserId) {
      const mark = await markService.getById(handle, markId)
      const personalMark = await personalMarkRepository.create(handle, userId, mark.id, givenByUserId)

      await this.sendReceivedMarkEmail(handle, personalMark)

      return personalMark
    },

    async listVisibleInformationForUser(handle, userId) {
      const personalMarks = await personalMarkRepository.findManyByUserId(handle, userId)
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
      const personalMark = await personalMarkRepository.delete(handle, userId, markId)
      if (!personalMark) {
        throw new NotFoundError(`PersonalMark(UserID=${userId}, MarkID=${markId}) not found`)
      }
      return personalMark
    },

    async countUsersByMarkId(handle, markId) {
      return await personalMarkRepository.countUsersByMarkId(handle, markId)
    },

    async findPunishmentByUserId(handle, userId) {
      const activeMarks = await findActiveMarks(handle, userId)
      const currentMarkWeight = activeMarks.reduce((total, mark) => total + mark.weight, 0)

      if (currentMarkWeight >= SUSPENSION_MARK_WEIGHT) {
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

      const mark = await markService.getById(handle, personalMark.markId)

      const organizerEmails = mark.groups.map((g) => g.email).filter((email) => email !== null)
      const markCountLabel = formatMarkCount(mark.weight)
      const activeMarks = await findActiveMarks(handle, personalMark.userId)
      const totalMarkWeight = activeMarks.reduce((total, activeMark) => total + activeMark.weight, 0)
      const isSuspension = mark.weight >= SUSPENSION_MARK_WEIGHT
      const endsAt =
        isSuspension && mark.duration >= INDEFINITE_SUSPENSION_DURATION
          ? null
          : getPunishmentExpiryDate(personalMark.createdAt, mark.duration).toISOString()

      await emailService.send(
        DEFAULT_EMAIL_SOURCE,
        getReplyToAddresses(organizerEmails),
        [user.email],
        [],
        [],
        isSuspension ? "Du har blitt suspendert" : `Du har fått ${markCountLabel}`,
        emails.RECEIVED_MARK,
        {
          title: mark.title,
          details: mark.details,
          markCountLabel,
          totalMarkCountLabel: formatMarkCount(totalMarkWeight),
          responsibleGroups: mark.groups.map((group) => ({ name: getGroupDisplayName(group), email: group.email })),
          isSuspension,
          isSuspended: totalMarkWeight >= SUSPENSION_MARK_WEIGHT,
          endsAt,
        }
      )
    },
  }
}
