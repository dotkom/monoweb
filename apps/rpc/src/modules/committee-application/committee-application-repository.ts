import type { DBHandle } from "@dotkomonline/db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { parseOrReport } from "../../invariant"
import { getGroupDisplayName } from "../group/group"
import {
  type CommitteeApplication,
  type CommitteeApplicationId,
  type CommitteeApplicationInterviewMatchingInput,
  CommitteeApplicationInterviewMatchingInputSchema,
  type CommitteeApplicationPeriodId,
  type CommitteeApplicationPeriodSummary,
  CommitteeApplicationPeriodSummarySchema,
  CommitteeApplicationSchema,
  type CommitteeApplicationWrite,
} from "./committee-application"

export interface CommitteeApplicationRepository {
  create(handle: DBHandle, data: CommitteeApplicationWrite): Promise<CommitteeApplication>
  update(
    handle: DBHandle,
    committeeApplicationId: CommitteeApplicationId,
    data: Partial<CommitteeApplicationWrite>
  ): Promise<CommitteeApplication>
  delete(handle: DBHandle, committeeApplicationId: CommitteeApplicationId): Promise<void>
  findById(handle: DBHandle, committeeApplicationId: CommitteeApplicationId): Promise<CommitteeApplication | null>
  findMany(handle: DBHandle, page: Pageable): Promise<CommitteeApplication[]>
  findOpenPeriod(handle: DBHandle, currentTime: Date): Promise<CommitteeApplicationPeriodSummary | null>
  findInterviewMatchingInput(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationInterviewMatchingInput | null>
}

export function getCommitteeApplicationRepository(): CommitteeApplicationRepository {
  return {
    async create(handle, data) {
      const committeeApplication = await handle.committeeApplication.create({
        data,
      })

      return parseOrReport(CommitteeApplicationSchema, committeeApplication)
    },

    async update(handle, committeeApplicationId, data) {
      const committeeApplication = await handle.committeeApplication.update({
        where: {
          id: committeeApplicationId,
        },
        data,
      })

      return parseOrReport(CommitteeApplicationSchema, committeeApplication)
    },

    async delete(handle, committeeApplicationId) {
      await handle.committeeApplication.delete({
        where: {
          id: committeeApplicationId,
        },
      })
    },

    async findById(handle, committeeApplicationId) {
      const committeeApplication = await handle.committeeApplication.findUnique({
        where: {
          id: committeeApplicationId,
        },
      })

      return parseOrReport(CommitteeApplicationSchema.nullable(), committeeApplication)
    },

    async findMany(handle, page) {
      const committeeApplications = await handle.committeeApplication.findMany({
        ...pageQuery(page),
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "asc",
          },
        ],
      })

      return parseOrReport(CommitteeApplicationSchema.array(), committeeApplications)
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
        select: {
          id: true,
          name: true,
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
            select: {
              id: true,
              type: true,
              group: {
                select: {
                  name: true,
                  abbreviation: true,
                  preferredDisplayName: true,
                  description: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      })

      if (applicationPeriod === null) {
        return null
      }

      return parseOrReport(CommitteeApplicationPeriodSummarySchema, {
        ...applicationPeriod,
        groups: applicationPeriod.groups.map((applicationGroup) => ({
          id: applicationGroup.id,
          name: getGroupDisplayName(applicationGroup.group),
          type: applicationGroup.type,
          description: applicationGroup.group.description,
          imageUrl: applicationGroup.group.imageUrl,
        })),
      })
    },

    async findInterviewMatchingInput(handle, applicationPeriodId) {
      const period = await handle.committeeApplicationPeriod.findUnique({
        where: { id: applicationPeriodId },
        select: {
          interviewsPublishedAt: true,
          applications: {
            select: {
              id: true,
              groupSelections: {
                select: {
                  id: true,
                  applicationId: true,
                  applicationGroupId: true,
                },
              },
              availabilityBlocks: {
                select: {
                  applicationId: true,
                  startsAt: true,
                  endsAt: true,
                },
              },
            },
          },
          groups: {
            select: {
              id: true,
              interviewDuration: true,
              interviewBlocks: {
                select: {
                  id: true,
                  applicationGroupId: true,
                  startsAt: true,
                  endsAt: true,
                  locationName: true,
                },
              },
            },
          },
        },
      })

      if (period === null) {
        return null
      }

      return parseOrReport(CommitteeApplicationInterviewMatchingInputSchema, {
        interviewsPublishedAt: period.interviewsPublishedAt,
        applications: period.applications,
        groups: period.groups,
        groupSelections: period.applications.flatMap((application) => application.groupSelections),
        availabilityBlocks: period.applications.flatMap((application) => application.availabilityBlocks),
        interviewBlocks: period.groups.flatMap((group) => group.interviewBlocks),
      })
    },
  }
}
