import { randomUUID } from "node:crypto"
import { type DBHandle, Prisma } from "@dotkomonline/db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
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
  type CommitteeApplicationGroupWithInterviewBlocks,
  CommitteeApplicationGroupWithInterviewBlocksSchema,
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

const applicationInclude = {
  groupSelections: {
    orderBy: [
      {
        rank: "asc",
      },
      {
        id: "asc",
      },
    ],
  },
  availabilityBlocks: {
    orderBy: {
      startsAt: "asc",
    },
  },
} satisfies Prisma.CommitteeApplicationInclude

function toInterviewAttendees(
  attendees: { userId: string; user: { name: string | null; imageUrl: string | null } }[]
): CommitteeApplicationInterviewAttendee[] {
  return attendees.map((attendee) => {
    return {
      userId: attendee.userId,
      name: attendee.user.name ?? "Ukjent bruker",
      imageUrl: attendee.user.imageUrl,
    }
  })
}

export interface CommitteeApplicationRepository {
  createPeriod(handle: DBHandle, data: CommitteeApplicationPeriodConfiguration): Promise<CommitteeApplicationPeriod>
  deletePeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>
  findPeriodById(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationPeriod | null>
  findManyPeriods(handle: DBHandle, page: Pageable): Promise<CommitteeApplicationPeriod[]>
  findOpenPeriod(handle: DBHandle, currentTime: Date): Promise<CommitteeApplicationOpenPeriod | null>
  updatePeriod(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    data: Partial<CommitteeApplicationPeriodConfiguration>
  ): Promise<CommitteeApplicationPeriod>
  setInterviewsPublishedAt(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    publishedAt: Date | null
  ): Promise<CommitteeApplicationPeriod>
  lockPeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>

  createGroups(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    groups: CommitteeApplicationGroupConfiguration[]
  ): Promise<void>
  deleteGroups(handle: DBHandle, applicationGroupIds: CommitteeApplicationGroupId[]): Promise<void>
  findApplicationGroupById(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId
  ): Promise<CommitteeApplicationGroup | null>
  findManyGroupsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroup[]>
  findManyGroupsWithInterviewBlocksByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroupWithInterviewBlocks[]>
  findGroupSelectionById(
    handle: DBHandle,
    groupSelectionId: CommitteeApplicationGroupSelectionId
  ): Promise<CommitteeApplicationGroupSelection | null>
  updateGroup(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId,
    data: CommitteeApplicationGroupConfiguration
  ): Promise<void>
  countGroupSelections(handle: DBHandle, applicationGroupId: CommitteeApplicationGroupId): Promise<number>

  submitApplication(handle: DBHandle, userId: UserId, data: CommitteeApplicationSubmit): Promise<CommitteeApplication>
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
  findApplicantView(
    handle: DBHandle,
    userId: UserId,
    applicationPeriodId?: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationApplicantView | null>
  findApplicantDetailsById(
    handle: DBHandle,
    applicationId: CommitteeApplicationId
  ): Promise<CommitteeApplicationApplicantDetails | null>
  updateApplication(
    handle: DBHandle,
    applicationId: CommitteeApplicationId,
    data: CommitteeApplicationUpdate
  ): Promise<CommitteeApplication>
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

  createInterview(
    handle: DBHandle,
    data: CommitteeApplicationInterviewAssignment
  ): Promise<CommitteeApplicationInterview>
  deleteInterview(handle: DBHandle, interviewId: CommitteeApplicationInterviewId): Promise<void>
  findInterviewById(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId
  ): Promise<CommitteeApplicationInterview | null>
  updateInterview(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId,
    data: CommitteeApplicationInterviewAssignment
  ): Promise<CommitteeApplicationInterview>

  findManyInterviewsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationInterview[]>
  findManyGroupMatchingsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroupMatching[]>
  findInterviewMatchingInput(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    publicationReferenceTime: Date
  ): Promise<CommitteeApplicationInterviewMatchingInput | null>
  replaceInterviews(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    interviews: CommitteeApplicationInterviewAssignment[]
  ): Promise<void>
}

export function getCommitteeApplicationRepository(): CommitteeApplicationRepository {
  return {
    async createPeriod(handle, data) {
      const storedApplicationPeriod = await handle.committeeApplicationPeriod.create({
        data,
      })

      return parseOrReport(CommitteeApplicationPeriodSchema, storedApplicationPeriod)
    },

    async deletePeriod(handle, applicationPeriodId) {
      // Neither applications nor groups cascade from the period, so they are removed first. Deleting the applications
      // cascades their group selections, which in turn cascades the interviews. The interviews have to be gone before
      // the groups are deleted, as the interview blocks restrict deletion while they still hold interviews.
      await handle.committeeApplication.deleteMany({
        where: {
          applicationPeriodId,
        },
      })

      await handle.committeeApplicationGroup.deleteMany({
        where: {
          applicationPeriodId,
        },
      })

      await handle.committeeApplicationPeriod.delete({
        where: {
          id: applicationPeriodId,
        },
      })
    },

    async findPeriodById(handle, applicationPeriodId) {
      const storedApplicationPeriod = await handle.committeeApplicationPeriod.findUnique({
        where: {
          id: applicationPeriodId,
        },
      })

      return parseOrReport(CommitteeApplicationPeriodSchema.nullable(), storedApplicationPeriod)
    },

    async findManyPeriods(handle, page) {
      const storedApplicationPeriods = await handle.committeeApplicationPeriod.findMany({
        ...pageQuery(page),
        orderBy: [
          {
            applicationsOpenAt: "desc",
          },
          {
            id: "asc",
          },
        ],
      })

      return parseOrReport(CommitteeApplicationPeriodSchema.array(), storedApplicationPeriods)
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

      const groups = applicationPeriod.groups.map((applicationGroup) => {
        return {
          id: applicationGroup.id,
          type: applicationGroup.type,
          name: getGroupDisplayName(applicationGroup.group),
          description: applicationGroup.group.description,
          imageUrl: applicationGroup.group.imageUrl,
        }
      })

      return parseOrReport(CommitteeApplicationOpenPeriodSchema, {
        ...applicationPeriod,
        groups,
      })
    },

    async updatePeriod(handle, applicationPeriodId, data) {
      const storedApplicationPeriod = await handle.committeeApplicationPeriod.update({
        where: {
          id: applicationPeriodId,
        },
        data,
      })

      return parseOrReport(CommitteeApplicationPeriodSchema, storedApplicationPeriod)
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

    async lockPeriod(handle, applicationPeriodId) {
      await handle.$queryRaw(
        Prisma.sql`SELECT id FROM committee_application_period WHERE id = ${applicationPeriodId} FOR UPDATE`
      )
    },

    async createGroups(handle, applicationPeriodId, groups) {
      await handle.committeeApplicationGroup.createMany({
        data: groups.map((group) => {
          return {
            ...group,
            applicationPeriodId,
          }
        }),
      })
    },

    async deleteGroups(handle, applicationGroupIds) {
      await handle.committeeApplicationGroup.deleteMany({
        where: {
          id: {
            in: applicationGroupIds,
          },
        },
      })
    },

    async findApplicationGroupById(handle, applicationGroupId) {
      const storedApplicationGroup = await handle.committeeApplicationGroup.findUnique({
        where: {
          id: applicationGroupId,
        },
      })

      return parseOrReport(CommitteeApplicationGroupSchema.nullable(), storedApplicationGroup)
    },

    async findManyGroupsByPeriodId(handle, applicationPeriodId) {
      const applicationGroups = await handle.committeeApplicationGroup.findMany({
        where: {
          applicationPeriodId,
        },
        orderBy: {
          groupId: "asc",
        },
      })

      return parseOrReport(CommitteeApplicationGroupSchema.array(), applicationGroups)
    },

    async findManyGroupsWithInterviewBlocksByPeriodId(handle, applicationPeriodId) {
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

      return parseOrReport(CommitteeApplicationGroupWithInterviewBlocksSchema.array(), applicationGroups)
    },

    async findGroupSelectionById(handle, groupSelectionId) {
      const storedGroupSelection = await handle.committeeApplicationGroupSelection.findUnique({
        where: {
          id: groupSelectionId,
        },
      })

      return parseOrReport(CommitteeApplicationGroupSelectionSchema.nullable(), storedGroupSelection)
    },

    async updateGroup(handle, applicationGroupId, data) {
      await handle.committeeApplicationGroup.update({
        where: {
          id: applicationGroupId,
        },
        data,
      })
    },

    async countGroupSelections(handle, applicationGroupId) {
      return handle.committeeApplicationGroupSelection.count({
        where: {
          applicationGroupId,
        },
      })
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
          data: data.groupSelections.map((selection) => {
            return {
              ...selection,
              applicationId,
              applicationPeriodId: data.applicationPeriodId,
            }
          }),
        })

        await handle.committeeApplicationAvailability.createMany({
          data: data.interviewAvailability.map((availability) => {
            return {
              ...availability,
              applicationId,
            }
          }),
        })
      }

      const storedApplication = await handle.committeeApplication.findUniqueOrThrow({
        where: {
          userId_applicationPeriodId: {
            userId,
            applicationPeriodId: data.applicationPeriodId,
          },
        },
        include: applicationInclude,
      })

      return parseOrReport(CommitteeApplicationSchema, storedApplication)
    },

    async findApplicationById(handle, applicationId) {
      const storedApplication = await handle.committeeApplication.findUnique({
        where: {
          id: applicationId,
        },
        include: applicationInclude,
      })

      return parseOrReport(CommitteeApplicationSchema.nullable(), storedApplication)
    },

    async findApplicationByUserAndPeriod(handle, userId, applicationPeriodId) {
      const storedApplication = await handle.committeeApplication.findUnique({
        where: {
          userId_applicationPeriodId: {
            userId,
            applicationPeriodId,
          },
        },
        include: applicationInclude,
      })

      return parseOrReport(CommitteeApplicationSchema.nullable(), storedApplication)
    },

    async findManyApplicationsByPeriodId(handle, applicationPeriodId, page) {
      const storedApplications = await handle.committeeApplication.findMany({
        ...pageQuery(page),
        where: {
          applicationPeriodId,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "asc",
          },
        ],
        include: applicationInclude,
      })

      return parseOrReport(CommitteeApplicationSchema.array(), storedApplications)
    },

    async findApplicantView(handle, userId, applicationPeriodId) {
      const application = await handle.committeeApplication.findFirst({
        where: {
          userId,
          applicationPeriodId,
          applicationPeriod: {
            isDraft: false,
          },
        },
        orderBy: [
          {
            applicationPeriod: {
              applicationsOpenAt: "desc",
            },
          },
          {
            id: "asc",
          },
        ],
        include: {
          ...applicationInclude,
          applicationPeriod: true,
          groupSelections: {
            orderBy: [
              {
                rank: "asc",
              },
              {
                id: "asc",
              },
            ],
            include: {
              applicationGroup: {
                include: {
                  group: true,
                },
              },
              interview: {
                include: {
                  interviewBlock: true,
                },
              },
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
            imageUrl: selection.applicationGroup.group.imageUrl,
            rank: selection.rank,
            interview,
          }
        }),
      })
    },

    async findApplicantDetailsById(handle, applicationId) {
      const application = await handle.committeeApplication.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          user: true,
          availabilityBlocks: {
            orderBy: {
              startsAt: "asc",
            },
          },
          groupSelections: {
            orderBy: [
              {
                rank: "asc",
              },
              {
                id: "asc",
              },
            ],
            include: {
              applicationGroup: true,
              interview: {
                include: {
                  interviewBlock: true,
                },
              },
              interviewAttendees: {
                orderBy: {
                  createdAt: "asc",
                },
                include: {
                  user: true,
                },
              },
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
        groupSelections: application.groupSelections.map((selection) => {
          return {
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
          }
        }),
      })
    },

    async updateApplication(handle, applicationId, data) {
      const application = await handle.committeeApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          aboutMe: data.aboutMe,
          studyYear: data.studyYear,
        },
      })

      await handle.committeeApplicationGroupSelection.deleteMany({
        where: {
          applicationId,
        },
      })

      await handle.committeeApplicationAvailability.deleteMany({
        where: {
          applicationId,
        },
      })

      await handle.committeeApplicationGroupSelection.createMany({
        data: data.groupSelections.map((selection) => {
          return {
            ...selection,
            applicationId,
            applicationPeriodId: application.applicationPeriodId,
          }
        }),
      })

      await handle.committeeApplicationAvailability.createMany({
        data: data.interviewAvailability.map((availability) => {
          return {
            ...availability,
            applicationId,
          }
        }),
      })

      const storedApplication = await handle.committeeApplication.findUniqueOrThrow({
        where: {
          id: applicationId,
        },
        include: applicationInclude,
      })

      return parseOrReport(CommitteeApplicationSchema, storedApplication)
    },

    async setInterviewAttendance(handle, applicationId, applicationGroupId, userId, isAttending) {
      const selection = await handle.committeeApplicationGroupSelection.findUnique({
        where: {
          applicationId_applicationGroupId: {
            applicationId,
            applicationGroupId,
          },
        },
      })

      if (selection === null) {
        return false
      }

      if (isAttending) {
        await handle.committeeApplicationInterviewAttendee.upsert({
          where: {
            groupSelectionId_userId: {
              groupSelectionId: selection.id,
              userId,
            },
          },
          create: {
            groupSelectionId: selection.id,
            userId,
          },
          update: {},
        })
      } else {
        await handle.committeeApplicationInterviewAttendee.deleteMany({
          where: {
            groupSelectionId: selection.id,
            userId,
          },
        })
      }

      return true
    },

    async findInterviewBlockById(handle, interviewBlockId) {
      const storedInterviewBlock = await handle.committeeApplicationInterviewBlock.findUnique({
        where: {
          id: interviewBlockId,
        },
      })

      return parseOrReport(CommitteeApplicationInterviewBlockSchema.nullable(), storedInterviewBlock)
    },

    async findManyInterviewBlocksByGroupId(handle, applicationGroupId) {
      const storedInterviewBlocks = await handle.committeeApplicationInterviewBlock.findMany({
        where: {
          applicationGroupId,
        },
        orderBy: [
          {
            startsAt: "asc",
          },
          {
            id: "asc",
          },
        ],
      })

      return parseOrReport(CommitteeApplicationInterviewBlockSchema.array(), storedInterviewBlocks)
    },

    async setInterviewBlocks(handle, applicationGroupId, blocks) {
      await handle.committeeApplicationInterviewBlock.deleteMany({
        where: {
          applicationGroupId,
          id: {
            notIn: blocks.map((block) => block.id),
          },
        },
      })

      for (const block of blocks) {
        const { id: interviewBlockId, ...configuration } = block

        await handle.committeeApplicationInterviewBlock.upsert({
          where: {
            id: interviewBlockId,
          },
          create: {
            id: interviewBlockId,
            applicationGroupId,
            ...configuration,
          },
          update: configuration,
        })
      }
    },

    async createInterview(handle, data) {
      const storedInterview = await handle.committeeApplicationInterview.create({
        data,
      })

      return parseOrReport(CommitteeApplicationInterviewSchema, storedInterview)
    },

    async deleteInterview(handle, interviewId) {
      await handle.committeeApplicationInterview.delete({
        where: {
          id: interviewId,
        },
      })
    },

    async findInterviewById(handle, interviewId) {
      const storedInterview = await handle.committeeApplicationInterview.findUnique({
        where: {
          id: interviewId,
        },
      })

      return parseOrReport(CommitteeApplicationInterviewSchema.nullable(), storedInterview)
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

    async findManyInterviewsByPeriodId(handle, applicationPeriodId) {
      const storedInterviews = await handle.committeeApplicationInterview.findMany({
        where: {
          groupSelection: {
            applicationPeriodId,
          },
        },
        orderBy: [
          {
            startsAt: "asc",
          },
          {
            id: "asc",
          },
        ],
      })

      return parseOrReport(CommitteeApplicationInterviewSchema.array(), storedInterviews)
    },

    async findManyGroupMatchingsByPeriodId(handle, applicationPeriodId) {
      const applicationGroups = await handle.committeeApplicationGroup.findMany({
        where: {
          applicationPeriodId,
        },
        orderBy: {
          groupId: "asc",
        },
        include: {
          groupSelections: {
            include: {
              interview: {
                include: {
                  interviewBlock: true,
                },
              },
              interviewAttendees: {
                orderBy: {
                  createdAt: "asc",
                },
                include: {
                  user: true,
                },
              },
              application: {
                include: {
                  user: true,
                  availabilityBlocks: {
                    orderBy: {
                      startsAt: "asc",
                    },
                  },
                },
              },
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
        where: {
          id: applicationPeriodId,
        },
        include: {
          applications: {
            include: applicationInclude,
          },
          groups: {
            include: {
              interviewBlocks: true,
            },
          },
        },
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

    async replaceInterviews(handle, applicationPeriodId, interviews) {
      await handle.committeeApplicationInterview.deleteMany({
        where: {
          groupSelection: {
            applicationPeriodId,
          },
        },
      })

      if (interviews.length > 0) {
        await handle.committeeApplicationInterview.createMany({
          data: interviews,
        })
      }
    },
  }
}
