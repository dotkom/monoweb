import { randomUUID } from "node:crypto"
import { type DBHandle, Prisma } from "@dotkomonline/db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { differenceInMinutes } from "date-fns"
import { parseOrReport } from "../../invariant"
import { getGroupDisplayName } from "../group/group"
import type { UserId } from "../user/user"
import {
  type CommitteeApplication,
  CommitteeApplicationSchema,
  type CommitteeApplicationPeriod,
  type CommitteeApplicationPeriodId,
  CommitteeApplicationPeriodSchema,
  type CommitteeApplicationPeriodConfiguration,
  type CommitteeApplicationGroupConfiguration,
  type CommitteeApplicationGroup,
  type CommitteeApplicationGroupId,
  CommitteeApplicationGroupSchema,
  type CommitteeApplicationGroupStatus,
  CommitteeApplicationGroupStatusSchema,
  type CommitteeApplicationGroupSelection,
  type CommitteeApplicationGroupSelectionId,
  CommitteeApplicationGroupSelectionSchema,
  type CommitteeApplicationId,
  type CommitteeApplicationSubmit,
  type CommitteeApplicationUpdate,
  type CommitteeApplicationInterviewBlock,
  type CommitteeApplicationInterviewBlockId,
  type CommitteeApplicationInterviewBlockInput,
  CommitteeApplicationInterviewBlockSchema,
  type CommitteeApplicationInterview,
  type CommitteeApplicationInterviewId,
  type CommitteeApplicationInterviewAssignment,
  CommitteeApplicationInterviewSchema,
  type CommitteeApplicationGroupMatching,
  CommitteeApplicationGroupMatchingSchema,
  type CommitteeApplicationOpenPeriod,
  CommitteeApplicationOpenPeriodSchema,
  type CommitteeApplicationApplicantView,
  CommitteeApplicationApplicantViewSchema,
  type CommitteeApplicationApplicantDetails,
  CommitteeApplicationApplicantDetailsSchema,
  type CommitteeApplicationInterviewAttendee,
} from "./committee-application"
import {
  type CommitteeApplicationInterviewMatchingInput,
  CommitteeApplicationInterviewMatchingInputSchema,
} from "./committee-application"
import { hasValidMazemapRoom } from "../mazemap/mazemap"

const applicationInclude = {
  groupSelections: { orderBy: [{ rank: "asc" }, { id: "asc" }] },
  availabilityBlocks: { orderBy: { startsAt: "asc" } },
} satisfies Prisma.CommitteeApplicationInclude

function toInterviewAttendees(
  attendees: { userId: string; user: { name: string | null; imageUrl: string | null } }[]
): CommitteeApplicationInterviewAttendee[] {
  return attendees.map((attendee) => ({
    userId: attendee.userId,
    name: attendee.user.name ?? "Ukjent bruker",
    imageUrl: attendee.user.imageUrl,
  }))
}

export interface CommitteeApplicationRepository {
  lockPeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>
  createPeriod(handle: DBHandle, data: CommitteeApplicationPeriodConfiguration): Promise<CommitteeApplicationPeriod>
  updatePeriod(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    data: Partial<CommitteeApplicationPeriodConfiguration>
  ): Promise<CommitteeApplicationPeriod>
  deletePeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>
  findPeriodById(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationPeriod | null>
  findManyPeriods(handle: DBHandle, page: Pageable): Promise<CommitteeApplicationPeriod[]>
  findOpenPeriod(handle: DBHandle, currentTime: Date): Promise<CommitteeApplicationOpenPeriod | null>
  setInterviewsPublishedAt(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    publishedAt: Date | null
  ): Promise<CommitteeApplicationPeriod>

  findApplicationGroupById(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId
  ): Promise<CommitteeApplicationGroup | null>
  findManyGroupsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroupStatus[]>
  createGroups(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    groups: CommitteeApplicationGroupConfiguration[]
  ): Promise<void>
  updateGroup(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId,
    data: CommitteeApplicationGroupConfiguration
  ): Promise<void>
  deleteGroups(handle: DBHandle, applicationGroupIds: CommitteeApplicationGroupId[]): Promise<void>
  countGroupSelections(handle: DBHandle, applicationGroupId: CommitteeApplicationGroupId): Promise<number>
  findGroupSelectionById(
    handle: DBHandle,
    groupSelectionId: CommitteeApplicationGroupSelectionId
  ): Promise<CommitteeApplicationGroupSelection | null>

  findApplicationById(handle: DBHandle, applicationId: CommitteeApplicationId): Promise<CommitteeApplication | null>
  findApplicationByUserAndPeriod(
    handle: DBHandle,
    userId: UserId,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplication | null>
  findManyApplicationsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    page: Pageable
  ): Promise<CommitteeApplication[]>
  submitApplication(handle: DBHandle, userId: UserId, data: CommitteeApplicationSubmit): Promise<CommitteeApplication>
  updateApplication(
    handle: DBHandle,
    applicationId: CommitteeApplicationId,
    data: CommitteeApplicationUpdate
  ): Promise<CommitteeApplication>
  findApplicantView(
    handle: DBHandle,
    userId: UserId,
    applicationPeriodId?: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationApplicantView | null>
  findApplicantDetailsById(
    handle: DBHandle,
    applicationId: CommitteeApplicationId
  ): Promise<CommitteeApplicationApplicantDetails | null>
  setInterviewAttendance(
    handle: DBHandle,
    applicationId: CommitteeApplicationId,
    applicationGroupId: CommitteeApplicationGroupId,
    userId: UserId,
    isAttending: boolean
  ): Promise<boolean>

  findInterviewBlockById(
    handle: DBHandle,
    interviewBlockId: CommitteeApplicationInterviewBlockId
  ): Promise<CommitteeApplicationInterviewBlock | null>
  findManyInterviewBlocksByGroupId(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId
  ): Promise<CommitteeApplicationInterviewBlock[]>
  setInterviewBlocks(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId,
    blocks: CommitteeApplicationInterviewBlockInput[]
  ): Promise<void>

  findManyGroupMatchingsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroupMatching[]>
  findInterviewMatchingInput(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    publicationReferenceTime: Date
  ): Promise<CommitteeApplicationInterviewMatchingInput | null>
  findManyInterviewsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationInterview[]>
  replaceInterviews(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    interviews: CommitteeApplicationInterviewAssignment[]
  ): Promise<void>

  findInterviewById(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId
  ): Promise<CommitteeApplicationInterview | null>
  createInterview(
    handle: DBHandle,
    data: CommitteeApplicationInterviewAssignment
  ): Promise<CommitteeApplicationInterview>
  updateInterview(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId,
    data: CommitteeApplicationInterviewAssignment
  ): Promise<CommitteeApplicationInterview>
  deleteInterview(handle: DBHandle, interviewId: CommitteeApplicationInterviewId): Promise<void>
}

export function getCommitteeApplicationRepository(): CommitteeApplicationRepository {
  return {
    async lockPeriod(handle, applicationPeriodId) {
      await handle.$queryRaw(
        Prisma.sql`SELECT id FROM committee_application_period WHERE id = ${applicationPeriodId} FOR UPDATE`
      )
    },

    async createPeriod(handle, data) {
      return parseOrReport(CommitteeApplicationPeriodSchema, await handle.committeeApplicationPeriod.create({ data }))
    },

    async updatePeriod(handle, applicationPeriodId, data) {
      return parseOrReport(
        CommitteeApplicationPeriodSchema,
        await handle.committeeApplicationPeriod.update({ where: { id: applicationPeriodId }, data })
      )
    },

    async deletePeriod(handle, applicationPeriodId) {
      // Neither applications nor groups cascade from the period, so they are removed first. Deleting the applications
      // cascades their group selections, which in turn cascades the interviews. The interviews have to be gone before
      // the groups are deleted, as the interview blocks restrict deletion while they still hold interviews.
      await handle.committeeApplication.deleteMany({ where: { applicationPeriodId } })
      await handle.committeeApplicationGroup.deleteMany({ where: { applicationPeriodId } })
      await handle.committeeApplicationPeriod.delete({ where: { id: applicationPeriodId } })
    },

    async findPeriodById(handle, applicationPeriodId) {
      return parseOrReport(
        CommitteeApplicationPeriodSchema.nullable(),
        await handle.committeeApplicationPeriod.findUnique({ where: { id: applicationPeriodId } })
      )
    },

    async findManyPeriods(handle, page) {
      return parseOrReport(
        CommitteeApplicationPeriodSchema.array(),
        await handle.committeeApplicationPeriod.findMany({
          ...pageQuery(page),
          orderBy: [{ applicationsOpenAt: "desc" }, { id: "asc" }],
        })
      )
    },

    async findOpenPeriod(handle, currentTime) {
      const applicationPeriod = await handle.committeeApplicationPeriod.findFirst({
        where: {
          isDraft: false,
          isEnabled: true,
          applicationsOpenAt: {
            lte: currentTime,
          },
          applicationsCloseAt: {
            gt: currentTime,
          },
        },
        orderBy: [
          {
            applicationsOpenAt: "desc",
          },
          {
            id: "asc",
          },
        ],
        include: {
          groups: {
            orderBy: [
              {
                group: {
                  name: "asc",
                },
              },
              {
                id: "asc",
              },
            ],
            include: {
              group: true,
            },
          },
        },
      })

      if (applicationPeriod === null) {
        return null
      }

      const groups = applicationPeriod.groups.map((applicationGroup) => ({
        id: applicationGroup.id,
        type: applicationGroup.type,
        name: getGroupDisplayName(applicationGroup.group),
        description: applicationGroup.group.description,
        imageUrl: applicationGroup.group.imageUrl,
      }))

      return parseOrReport(CommitteeApplicationOpenPeriodSchema, {
        ...applicationPeriod,
        groups,
      })
    },

    async setInterviewsPublishedAt(handle, applicationPeriodId, publishedAt) {
      const data = await handle.committeeApplicationPeriod.update({
        where: {
          id: applicationPeriodId,
        },
        data: {
          interviewsPublishedAt: publishedAt,
        },
      })

      return parseOrReport(CommitteeApplicationPeriodSchema, data)
    },

    async findApplicationGroupById(handle, applicationGroupId) {
      return parseOrReport(
        CommitteeApplicationGroupSchema.nullable(),
        await handle.committeeApplicationGroup.findUnique({
          where: {
            id: applicationGroupId,
          },
        })
      )
    },

    async findManyGroupsByPeriodId(handle, applicationPeriodId) {
      const applicationGroups = await handle.committeeApplicationGroup.findMany({
        where: {
          applicationPeriodId,
        },
        orderBy: {
          groupId: "asc",
        },
        include: {
          interviewBlocks: {
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      })

      return parseOrReport(
        CommitteeApplicationGroupStatusSchema.array(),
        applicationGroups.map((applicationGroup) => ({
          ...applicationGroup,
          interviewBlockCount: applicationGroup.interviewBlocks.length,
          interviewBlocksUpdatedAt: applicationGroup.interviewBlocks.at(0)?.updatedAt ?? null,
          interviewMinutes: applicationGroup.interviewBlocks.reduce(
            (total, block) => total + differenceInMinutes(block.endsAt, block.startsAt),
            0
          ),
          hasAllValidRooms:
            applicationGroup.interviewBlocks.length > 0 &&
            applicationGroup.interviewBlocks.every((block) =>
              hasValidMazemapRoom(block.locationName, block.locationUrl)
            ),
        }))
      )
    },
    async createGroups(handle, applicationPeriodId, groups) {
      await handle.committeeApplicationGroup.createMany({
        data: groups.map((group) => ({ ...group, applicationPeriodId })),
      })
    },
    async updateGroup(handle, applicationGroupId, data) {
      await handle.committeeApplicationGroup.update({ where: { id: applicationGroupId }, data })
    },
    async deleteGroups(handle, applicationGroupIds) {
      await handle.committeeApplicationGroup.deleteMany({ where: { id: { in: applicationGroupIds } } })
    },
    async countGroupSelections(handle, applicationGroupId) {
      return handle.committeeApplicationGroupSelection.count({ where: { applicationGroupId } })
    },
    async findGroupSelectionById(handle, groupSelectionId) {
      return parseOrReport(
        CommitteeApplicationGroupSelectionSchema.nullable(),
        await handle.committeeApplicationGroupSelection.findUnique({ where: { id: groupSelectionId } })
      )
    },

    async findApplicationById(handle, applicationId) {
      return parseOrReport(
        CommitteeApplicationSchema.nullable(),
        await handle.committeeApplication.findUnique({ where: { id: applicationId }, include: applicationInclude })
      )
    },
    async findApplicationByUserAndPeriod(handle, userId, applicationPeriodId) {
      return parseOrReport(
        CommitteeApplicationSchema.nullable(),
        await handle.committeeApplication.findUnique({
          where: { userId_applicationPeriodId: { userId, applicationPeriodId } },
          include: applicationInclude,
        })
      )
    },
    async findManyApplicationsByPeriodId(handle, applicationPeriodId, page) {
      return parseOrReport(
        CommitteeApplicationSchema.array(),
        await handle.committeeApplication.findMany({
          ...pageQuery(page),
          where: { applicationPeriodId },
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          include: applicationInclude,
        })
      )
    },
    async submitApplication(handle, userId, data) {
      const applicationId = randomUUID()
      const creation = await handle.committeeApplication.createMany({
        data: {
          id: applicationId,
          userId,
          applicationPeriodId: data.applicationPeriodId,
          aboutMe: data.aboutMe,
          studyYear: data.studyYear,
        },
        skipDuplicates: true,
      })
      if (creation.count > 0) {
        await handle.committeeApplicationGroupSelection.createMany({
          data: data.groupSelections.map((selection) => ({
            ...selection,
            applicationId,
            applicationPeriodId: data.applicationPeriodId,
          })),
        })
        await handle.committeeApplicationAvailability.createMany({
          data: data.interviewAvailability.map((availability) => ({ ...availability, applicationId })),
        })
      }
      return parseOrReport(
        CommitteeApplicationSchema,
        await handle.committeeApplication.findUniqueOrThrow({
          where: { userId_applicationPeriodId: { userId, applicationPeriodId: data.applicationPeriodId } },
          include: applicationInclude,
        })
      )
    },
    async updateApplication(handle, applicationId, data) {
      const application = await handle.committeeApplication.update({
        where: { id: applicationId },
        data: { aboutMe: data.aboutMe, studyYear: data.studyYear },
      })
      await handle.committeeApplicationGroupSelection.deleteMany({ where: { applicationId } })
      await handle.committeeApplicationAvailability.deleteMany({ where: { applicationId } })
      await handle.committeeApplicationGroupSelection.createMany({
        data: data.groupSelections.map((selection) => ({
          ...selection,
          applicationId,
          applicationPeriodId: application.applicationPeriodId,
        })),
      })
      await handle.committeeApplicationAvailability.createMany({
        data: data.interviewAvailability.map((availability) => ({ ...availability, applicationId })),
      })
      return parseOrReport(
        CommitteeApplicationSchema,
        await handle.committeeApplication.findUniqueOrThrow({
          where: { id: applicationId },
          include: applicationInclude,
        })
      )
    },
    async findApplicantView(handle, userId, applicationPeriodId) {
      const application = await handle.committeeApplication.findFirst({
        where: { userId, applicationPeriodId, applicationPeriod: { isDraft: false } },
        orderBy: [{ applicationPeriod: { applicationsOpenAt: "desc" } }, { id: "asc" }],
        include: {
          ...applicationInclude,
          applicationPeriod: true,
          groupSelections: {
            orderBy: [{ rank: "asc" }, { id: "asc" }],
            include: {
              applicationGroup: { include: { group: true } },
              interview: { include: { interviewBlock: true } },
            },
          },
        },
      })
      if (application === null) {
        return null
      }
      return parseOrReport(CommitteeApplicationApplicantViewSchema, {
        ...application,
        applicationPeriodName: application.applicationPeriod.name,
        applicationsCloseAt: application.applicationPeriod.applicationsCloseAt,
        interviewsPublishedAt: application.applicationPeriod.interviewsPublishedAt,
        groups: application.groupSelections.map((selection) => {
          let interview = null
          if (application.applicationPeriod.interviewsPublishedAt !== null && selection.interview !== null) {
            interview = {
              ...selection.interview,
              locationName: selection.interview.interviewBlock.locationName,
              locationUrl: selection.interview.interviewBlock.locationUrl,
            }
          }
          return {
            id: selection.applicationGroup.id,
            name: getGroupDisplayName(selection.applicationGroup.group),
            rank: selection.rank,
            interview,
          }
        }),
      })
    },

    async findApplicantDetailsById(handle, applicationId) {
      const application = await handle.committeeApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          availabilityBlocks: { orderBy: { startsAt: "asc" } },
          groupSelections: {
            orderBy: [{ rank: "asc" }, { id: "asc" }],
            include: {
              applicationGroup: true,
              interview: { include: { interviewBlock: true } },
              interviewAttendees: { orderBy: { createdAt: "asc" }, include: { user: true } },
            },
          },
        },
      })
      if (application === null) {
        return null
      }
      return parseOrReport(CommitteeApplicationApplicantDetailsSchema, {
        applicationId: application.id,
        name: application.user.name ?? "Ukjent søker",
        email: application.user.email,
        phone: application.user.phone,
        studyYear: application.studyYear,
        aboutMe: application.aboutMe,
        createdAt: application.createdAt,
        availability: application.availabilityBlocks,
        groupSelections: application.groupSelections.map((selection) => ({
          applicationGroupId: selection.applicationGroup.id,
          groupId: selection.applicationGroup.groupId,
          rank: selection.rank,
          interview:
            selection.interview === null
              ? null
              : {
                  ...selection.interview,
                  locationName: selection.interview.interviewBlock.locationName,
                  locationUrl: selection.interview.interviewBlock.locationUrl,
                  attendees: toInterviewAttendees(selection.interviewAttendees),
                },
        })),
      })
    },
    async setInterviewAttendance(handle, applicationId, applicationGroupId, userId, isAttending) {
      const selection = await handle.committeeApplicationGroupSelection.findUnique({
        where: { applicationId_applicationGroupId: { applicationId, applicationGroupId } },
      })
      if (selection === null) {
        return false
      }
      if (isAttending) {
        await handle.committeeApplicationInterviewAttendee.upsert({
          where: { groupSelectionId_userId: { groupSelectionId: selection.id, userId } },
          create: { groupSelectionId: selection.id, userId },
          update: {},
        })
      } else {
        await handle.committeeApplicationInterviewAttendee.deleteMany({
          where: { groupSelectionId: selection.id, userId },
        })
      }
      return true
    },

    async findInterviewBlockById(handle, interviewBlockId) {
      return parseOrReport(
        CommitteeApplicationInterviewBlockSchema.nullable(),
        await handle.committeeApplicationInterviewBlock.findUnique({ where: { id: interviewBlockId } })
      )
    },
    async findManyInterviewBlocksByGroupId(handle, applicationGroupId) {
      return parseOrReport(
        CommitteeApplicationInterviewBlockSchema.array(),
        await handle.committeeApplicationInterviewBlock.findMany({
          where: { applicationGroupId },
          orderBy: [{ startsAt: "asc" }, { id: "asc" }],
        })
      )
    },
    async setInterviewBlocks(handle, applicationGroupId, blocks) {
      await handle.committeeApplicationInterviewBlock.deleteMany({
        where: { applicationGroupId, id: { notIn: blocks.map((block) => block.id) } },
      })
      for (const block of blocks) {
        const { id: interviewBlockId, ...configuration } = block
        await handle.committeeApplicationInterviewBlock.upsert({
          where: { id: interviewBlockId },
          create: { id: interviewBlockId, applicationGroupId, ...configuration },
          update: configuration,
        })
      }
    },
    async findManyGroupMatchingsByPeriodId(handle, applicationPeriodId) {
      const applicationGroups = await handle.committeeApplicationGroup.findMany({
        where: { applicationPeriodId },
        orderBy: { groupId: "asc" },
        include: {
          groupSelections: {
            include: {
              interview: { include: { interviewBlock: true } },
              interviewAttendees: { orderBy: { createdAt: "asc" }, include: { user: true } },
              application: { include: { user: true, availabilityBlocks: { orderBy: { startsAt: "asc" } } } },
            },
          },
        },
      })
      return parseOrReport(
        CommitteeApplicationGroupMatchingSchema.array(),
        applicationGroups.map((applicationGroup) => {
          const matchedInterviews = []
          const unmatchedApplicants = []
          for (const selection of applicationGroup.groupSelections) {
            const applicant = {
              groupSelectionId: selection.id,
              applicationId: selection.applicationId,
              name: selection.application.user.name ?? "Ukjent søker",
              email: selection.application.user.email,
              phone: selection.application.user.phone,
              rank: selection.rank,
              availability: selection.application.availabilityBlocks,
            }
            if (selection.interview === null) {
              unmatchedApplicants.push(applicant)
            } else {
              matchedInterviews.push({
                ...selection.interview,
                ...applicant,
                locationName: selection.interview.interviewBlock.locationName,
                locationUrl: selection.interview.interviewBlock.locationUrl,
                attendees: toInterviewAttendees(selection.interviewAttendees),
              })
            }
          }
          return {
            applicationGroupId: applicationGroup.id,
            groupId: applicationGroup.groupId,
            totalApplicants: applicationGroup.groupSelections.length,
            matchedApplicants: matchedInterviews.length,
            matchedInterviews,
            unmatchedApplicants,
          }
        })
      )
    },
    async findInterviewMatchingInput(handle, applicationPeriodId, publicationReferenceTime) {
      const applicationPeriod = await handle.committeeApplicationPeriod.findUnique({
        where: { id: applicationPeriodId },
        include: { applications: { include: applicationInclude }, groups: { include: { interviewBlocks: true } } },
      })
      if (applicationPeriod === null) {
        return null
      }
      return parseOrReport(CommitteeApplicationInterviewMatchingInputSchema, {
        publicationReferenceTime,
        applications: applicationPeriod.applications,
        groups: applicationPeriod.groups,
        groupSelections: applicationPeriod.applications.flatMap((application) => application.groupSelections),
        availabilityBlocks: applicationPeriod.applications.flatMap((application) => application.availabilityBlocks),
        interviewBlocks: applicationPeriod.groups.flatMap((applicationGroup) => applicationGroup.interviewBlocks),
      })
    },

    async findManyInterviewsByPeriodId(handle, applicationPeriodId) {
      return parseOrReport(
        CommitteeApplicationInterviewSchema.array(),
        await handle.committeeApplicationInterview.findMany({
          where: { groupSelection: { applicationPeriodId } },
          orderBy: [{ startsAt: "asc" }, { id: "asc" }],
        })
      )
    },

    async replaceInterviews(handle, applicationPeriodId, interviews) {
      await handle.committeeApplicationInterview.deleteMany({ where: { groupSelection: { applicationPeriodId } } })

      if (interviews.length > 0) {
        await handle.committeeApplicationInterview.createMany({ data: interviews })
      }
    },

    async findInterviewById(handle, interviewId) {
      return parseOrReport(
        CommitteeApplicationInterviewSchema.nullable(),
        await handle.committeeApplicationInterview.findUnique({ where: { id: interviewId } })
      )
    },

    async createInterview(handle, data) {
      return parseOrReport(
        CommitteeApplicationInterviewSchema,
        await handle.committeeApplicationInterview.create({ data })
      )
    },

    async updateInterview(handle, interviewId, data) {
      const result = await handle.committeeApplicationInterview.update({
        where: {
          id: interviewId,
        },
        data,
      })

      return parseOrReport(CommitteeApplicationInterviewSchema, result)
    },

    async deleteInterview(handle, interviewId) {
      await handle.committeeApplicationInterview.delete({
        where: {
          id: interviewId,
        },
      })
    },
  }
}
