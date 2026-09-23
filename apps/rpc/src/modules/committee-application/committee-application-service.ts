import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { addMinutes, format, parseISO } from "date-fns"
import { tz } from "@date-fns/tz"
import { FailedPreconditionError, IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import type { UserId } from "../user/user"
import {
  type CommitteeApplication,
  type CommitteeApplicationId,
  type CommitteeApplicationSubmit,
  CommitteeApplicationSubmitSchema,
  type CommitteeApplicationUpdate,
  CommitteeApplicationUpdateSchema,
  type CommitteeApplicationPeriod,
  type CommitteeApplicationPeriodId,
  type CommitteeApplicationPeriodCreate,
  CommitteeApplicationPeriodCreateSchema,
  type CommitteeApplicationPeriodUpdate,
  CommitteeApplicationPeriodUpdateSchema,
  CommitteeApplicationPeriodConfigurationSchema,
  type CommitteeApplicationGroup,
  type CommitteeApplicationGroupId,
  type CommitteeApplicationGroupConfiguration,
  type CommitteeApplicationGroupStatus,
  type CommitteeApplicationGroupSelectionId,
  type CommitteeApplicationInterviewBlock,
  type CommitteeApplicationInterviewBlocksSet,
  CommitteeApplicationInterviewBlocksSetSchema,
  type CommitteeApplicationInterview,
  type CommitteeApplicationInterviewId,
  type CommitteeApplicationInterviewPlacement,
  CommitteeApplicationInterviewPlacementSchema,
  type CommitteeApplicationOpenPeriod,
  type CommitteeApplicationApplicantView,
  type CommitteeApplicationApplicantDetails,
  type CommitteeApplicationInterviewSchedule,
  type CommitteeApplicationInterviewAssignment,
  type CommitteeApplicationInterviewMatchingInput,
  type CommitteeApplicationInterviewMatcher,
  COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS,
  COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES,
  COMMITTEE_APPLICATION_APPLICANT_BUFFER_MINUTES,
  COMMITTEE_APPLICATION_INTERVIEW_HOURS,
  isInterviewAvailabilityValid,
} from "./committee-application"
import { hasValidMazemapRoom } from "../mazemap/mazemap"
import type { CommitteeApplicationRepository } from "./committee-application-repository"

export interface CommitteeApplicationService {
  createPeriod(handle: DBHandle, data: CommitteeApplicationPeriodCreate): Promise<CommitteeApplicationPeriod>
  updatePeriod(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    data: CommitteeApplicationPeriodUpdate
  ): Promise<CommitteeApplicationPeriod>
  deletePeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>
  getPeriodById(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationPeriod>
  findManyPeriods(handle: DBHandle, page: Pageable): Promise<CommitteeApplicationPeriod[]>
  findOpenPeriod(handle: DBHandle): Promise<CommitteeApplicationOpenPeriod | null>

  getApplicationGroupById(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId
  ): Promise<CommitteeApplicationGroup>
  findManyGroupsByPeriodId(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationGroupStatus[]>

  submitApplication(handle: DBHandle, userId: UserId, data: CommitteeApplicationSubmit): Promise<CommitteeApplication>
  updateApplication(
    handle: DBHandle,
    userId: UserId,
    applicationId: CommitteeApplicationId,
    data: CommitteeApplicationUpdate
  ): Promise<CommitteeApplication>
  getApplicationById(handle: DBHandle, applicationId: CommitteeApplicationId): Promise<CommitteeApplication>
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
  getApplicantDetailsById(
    handle: DBHandle,
    applicationId: CommitteeApplicationId
  ): Promise<CommitteeApplicationApplicantDetails>
  setInterviewAttendance(
    handle: DBHandle,
    applicationId: CommitteeApplicationId,
    applicationGroupId: CommitteeApplicationGroupId,
    userId: UserId,
    isAttending: boolean
  ): Promise<void>

  setInterviewBlocks(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId,
    data: CommitteeApplicationInterviewBlocksSet
  ): Promise<CommitteeApplicationInterviewBlock[]>
  findManyInterviewBlocksByGroupId(
    handle: DBHandle,
    applicationGroupId: CommitteeApplicationGroupId
  ): Promise<CommitteeApplicationInterviewBlock[]>

  generateInterviews(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationInterviewSchedule>
  clearInterviews(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId): Promise<void>
  confirmInterviews(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationPeriod>
  getInterviewSchedule(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId
  ): Promise<CommitteeApplicationInterviewSchedule>

  scheduleInterview(
    handle: DBHandle,
    groupSelectionId: CommitteeApplicationGroupSelectionId,
    data: CommitteeApplicationInterviewPlacement
  ): Promise<CommitteeApplicationInterview>
  rescheduleInterview(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId,
    data: CommitteeApplicationInterviewPlacement
  ): Promise<CommitteeApplicationInterview>
  cancelInterview(handle: DBHandle, interviewId: CommitteeApplicationInterviewId): Promise<void>
  getInterviewById(
    handle: DBHandle,
    interviewId: CommitteeApplicationInterviewId
  ): Promise<CommitteeApplicationInterview>
}

function requireUnpublishedSchedule(applicationPeriod: CommitteeApplicationPeriod) {
  if (applicationPeriod.interviewsPublishedAt !== null) {
    throw new IllegalStateError("Published interviews must be corrected individually")
  }
}
function requireClosedApplications(applicationPeriod: CommitteeApplicationPeriod, currentTime: Date) {
  if (applicationPeriod.isDraft || currentTime < applicationPeriod.applicationsCloseAt) {
    throw new FailedPreconditionError("Applications must be closed before scheduling interviews")
  }
}
function validateApplication(
  data: CommitteeApplicationUpdate,
  applicationPeriod: CommitteeApplicationPeriod,
  applicationGroups: CommitteeApplicationGroup[],
  currentTime: Date
) {
  if (
    applicationPeriod.isDraft ||
    !applicationPeriod.isEnabled ||
    currentTime < applicationPeriod.applicationsOpenAt ||
    currentTime >= applicationPeriod.applicationsCloseAt ||
    applicationPeriod.interviewsPublishedAt !== null
  ) {
    throw new FailedPreconditionError("Dette opptaket er ikke åpent for søknader nå.")
  }
  const selectedGroupIds = new Set(data.groupSelections.map((selection) => selection.applicationGroupId))
  if (selectedGroupIds.size !== data.groupSelections.length) {
    throw new InvalidArgumentError("Du kan bare velge hver komité én gang.")
  }
  const exclusiveRanks: number[] = []
  for (const selection of data.groupSelections) {
    const applicationGroup = applicationGroups.find((candidate) => candidate.id === selection.applicationGroupId)
    if (applicationGroup === undefined) {
      throw new InvalidArgumentError("Velg komiteer som deltar i dette opptaket.")
    }
    if (applicationGroup.type === "EXCLUSIVE") {
      if (selection.rank === null) {
        throw new InvalidArgumentError("Eksklusive komiteer må prioriteres.")
      }
      exclusiveRanks.push(selection.rank)
    } else if (selection.rank !== null) {
      throw new InvalidArgumentError("Andre grupper skal ikke prioriteres.")
    }
  }
  if (
    exclusiveRanks.length > COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS ||
    exclusiveRanks
      .toSorted((firstRank, secondRank) => firstRank - secondRank)
      .some((rank, rankIndex) => rank !== rankIndex + 1)
  ) {
    throw new InvalidArgumentError("Velg inntil tre eksklusive komiteer i en sammenhengende prioritert rekkefølge.")
  }
  if (
    !data.interviewAvailability.every((availability) => isInterviewAvailabilityValid(availability, applicationPeriod))
  ) {
    throw new InvalidArgumentError("Velg gyldige tidsrom i intervjuperioden, mellom 09:00 og 17:00 norsk tid.")
  }
}
function validatePeriodConfiguration(data: CommitteeApplicationPeriodCreate["applicationPeriod"]) {
  const timeContext = { in: tz(COMMITTEE_APPLICATION_INTERVIEW_HOURS.timeZone) }
  const firstInterviewDate = format(data.interviewsStartDate, "yyyy-MM-dd", timeContext)
  const lastInterviewDate = format(data.interviewsEndDate, "yyyy-MM-dd", timeContext)
  const firstInterviewStartsAt = parseISO(
    `${firstInterviewDate}T${COMMITTEE_APPLICATION_INTERVIEW_HOURS.startsAt}`,
    timeContext
  )
  if (
    data.applicationsOpenAt >= data.applicationsCloseAt ||
    firstInterviewDate > lastInterviewDate ||
    firstInterviewStartsAt < data.applicationsCloseAt
  ) {
    throw new InvalidArgumentError(
      "Application dates must be ordered and interviews must start after the application window"
    )
  }
}
function validateGroupConfigurations(groups: CommitteeApplicationGroupConfiguration[]) {
  if (new Set(groups.map((group) => group.groupId)).size !== groups.length) {
    throw new InvalidArgumentError("A group may only participate once in an application period")
  }
}
function validateInterviewAssignment(
  applicationPeriod: CommitteeApplicationPeriod,
  input: CommitteeApplicationInterviewMatchingInput,
  assignment: CommitteeApplicationInterviewAssignment,
  interviews: CommitteeApplicationInterviewAssignment[]
) {
  if (!isInterviewAvailabilityValid(assignment, applicationPeriod)) {
    throw new InvalidArgumentError("The interview must be within the interview window")
  }
  const selection = input.groupSelections.find((candidate) => candidate.id === assignment.groupSelectionId)
  const applicationGroup = input.groups.find((candidate) => candidate.id === assignment.applicationGroupId)
  const interviewBlock = input.interviewBlocks.find((candidate) => candidate.id === assignment.interviewBlockId)
  if (
    selection === undefined ||
    applicationGroup === undefined ||
    interviewBlock === undefined ||
    selection.applicationGroupId !== assignment.applicationGroupId ||
    interviewBlock.applicationGroupId !== assignment.applicationGroupId
  ) {
    throw new InvalidArgumentError("The selected interview block must belong to the selected committee")
  }
  const durationMilliseconds =
    COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES[applicationGroup.interviewDuration] * 60_000
  if (
    assignment.endsAt.getTime() - assignment.startsAt.getTime() !== durationMilliseconds ||
    assignment.startsAt < interviewBlock.startsAt ||
    assignment.endsAt > interviewBlock.endsAt
  ) {
    throw new InvalidArgumentError(
      "The interview must fit inside its block and have the committee's configured duration"
    )
  }
  const availability = input.availabilityBlocks
    .filter((block) => block.applicationId === selection.applicationId)
    .toSorted((firstBlock, secondBlock) => firstBlock.startsAt.getTime() - secondBlock.startsAt.getTime())
  let coveredUntil = assignment.startsAt.getTime()
  for (const interval of availability) {
    if (interval.startsAt.getTime() <= coveredUntil && interval.endsAt.getTime() > coveredUntil) {
      coveredUntil = interval.endsAt.getTime()
    }
  }
  if (coveredUntil < assignment.endsAt.getTime()) {
    throw new InvalidArgumentError("The interview must fit within the applicant's availability")
  }
  for (const existingInterview of interviews) {
    if (existingInterview.groupSelectionId === assignment.groupSelectionId) {
      throw new InvalidArgumentError("This selection already has an interview")
    }
    const existingSelection = input.groupSelections.find(
      (candidate) => candidate.id === existingInterview.groupSelectionId
    )
    if (
      existingSelection?.applicationId === selection.applicationId &&
      assignment.startsAt < addMinutes(existingInterview.endsAt, COMMITTEE_APPLICATION_APPLICANT_BUFFER_MINUTES) &&
      addMinutes(assignment.endsAt, COMMITTEE_APPLICATION_APPLICANT_BUFFER_MINUTES) > existingInterview.startsAt
    ) {
      throw new InvalidArgumentError("The applicant must have at least 15 minutes between interviews")
    }
    const existingBlock = input.interviewBlocks.find((candidate) => candidate.id === existingInterview.interviewBlockId)
    if (
      existingBlock?.applicationGroupId === interviewBlock.applicationGroupId &&
      existingBlock.locationName === interviewBlock.locationName &&
      assignment.startsAt < existingInterview.endsAt &&
      assignment.endsAt > existingInterview.startsAt
    ) {
      throw new InvalidArgumentError("The committee's interview room is already occupied")
    }
  }
}

export function getCommitteeApplicationService(
  repository: CommitteeApplicationRepository,
  interviewMatcher?: CommitteeApplicationInterviewMatcher
): CommitteeApplicationService {
  async function lockPeriod(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId) {
    await repository.lockPeriod(handle, applicationPeriodId)
    const applicationPeriod = await repository.findPeriodById(handle, applicationPeriodId)
    if (applicationPeriod === null) {
      throw new NotFoundError(`CommitteeApplicationPeriod(ID=${applicationPeriodId}) not found`)
    }
    return applicationPeriod
  }
  async function setPeriodGroups(
    handle: DBHandle,
    applicationPeriodId: CommitteeApplicationPeriodId,
    groups: CommitteeApplicationGroupConfiguration[]
  ) {
    validateGroupConfigurations(groups)
    const existingGroups = await repository.findManyGroupsByPeriodId(handle, applicationPeriodId)
    for (const existingGroup of existingGroups) {
      const incomingGroup = groups.find((candidate) => candidate.groupId === existingGroup.groupId)
      if (
        (incomingGroup === undefined || incomingGroup.type !== existingGroup.type) &&
        (await repository.countGroupSelections(handle, existingGroup.id)) > 0
      ) {
        throw new FailedPreconditionError("Groups with applicants cannot be removed or change selection policy")
      }
    }
    const removedGroupIds = existingGroups
      .filter((existingGroup) => !groups.some((group) => group.groupId === existingGroup.groupId))
      .map((group) => group.id)
    if (removedGroupIds.length > 0) {
      await repository.deleteGroups(handle, removedGroupIds)
    }
    for (const group of groups) {
      const existingGroup = existingGroups.find((candidate) => candidate.groupId === group.groupId)
      if (existingGroup !== undefined) {
        await repository.updateGroup(handle, existingGroup.id, group)
      }
    }
    const addedGroups = groups.filter(
      (group) => !existingGroups.some((existingGroup) => existingGroup.groupId === group.groupId)
    )
    if (addedGroups.length > 0) {
      await repository.createGroups(handle, applicationPeriodId, addedGroups)
    }
  }
  async function getMatchingInput(handle: DBHandle, applicationPeriodId: CommitteeApplicationPeriodId) {
    const input = await repository.findInterviewMatchingInput(handle, applicationPeriodId, new Date())
    if (input === null) {
      throw new NotFoundError(`CommitteeApplicationPeriod(ID=${applicationPeriodId}) not found`)
    }
    return input
  }
  return {
    async createPeriod(handle, data) {
      const configuration = CommitteeApplicationPeriodCreateSchema.parse(data)
      validatePeriodConfiguration(configuration.applicationPeriod)
      validateGroupConfigurations(configuration.groups)
      const applicationPeriod = await repository.createPeriod(handle, configuration.applicationPeriod)
      await repository.createGroups(handle, applicationPeriod.id, configuration.groups)
      return applicationPeriod
    },
    async updatePeriod(handle, applicationPeriodId, data) {
      const configuration = CommitteeApplicationPeriodUpdateSchema.parse(data)
      const applicationPeriod = await lockPeriod(handle, applicationPeriodId)
      requireUnpublishedSchedule(applicationPeriod)
      const updatedConfiguration = CommitteeApplicationPeriodConfigurationSchema.parse({
        ...applicationPeriod,
        ...configuration.applicationPeriod,
      })
      validatePeriodConfiguration(updatedConfiguration)
      const matchingInput = await getMatchingInput(handle, applicationPeriodId)
      if (
        !matchingInput.availabilityBlocks.every((availability) =>
          isInterviewAvailabilityValid(availability, updatedConfiguration)
        )
      ) {
        throw new FailedPreconditionError("The new interview dates would invalidate applicant availability")
      }
      await repository.replaceInterviews(handle, applicationPeriodId, [])
      if (configuration.groups !== undefined) {
        await setPeriodGroups(handle, applicationPeriodId, configuration.groups)
      }
      return repository.updatePeriod(handle, applicationPeriodId, configuration.applicationPeriod)
    },
    async deletePeriod(handle, applicationPeriodId) {
      await lockPeriod(handle, applicationPeriodId)
      await repository.deletePeriod(handle, applicationPeriodId)
    },
    async getPeriodById(handle, applicationPeriodId) {
      const applicationPeriod = await repository.findPeriodById(handle, applicationPeriodId)
      if (applicationPeriod === null) {
        throw new NotFoundError(`CommitteeApplicationPeriod(ID=${applicationPeriodId}) not found`)
      }
      return applicationPeriod
    },
    async findManyPeriods(handle, page) {
      return repository.findManyPeriods(handle, page)
    },
    async findOpenPeriod(handle) {
      return repository.findOpenPeriod(handle, new Date())
    },

    async getApplicationGroupById(handle, applicationGroupId) {
      const applicationGroup = await repository.findApplicationGroupById(handle, applicationGroupId)
      if (applicationGroup === null) {
        throw new NotFoundError(`CommitteeApplicationGroup(ID=${applicationGroupId}) not found`)
      }
      return applicationGroup
    },
    async findManyGroupsByPeriodId(handle, applicationPeriodId) {
      await this.getPeriodById(handle, applicationPeriodId)
      return repository.findManyGroupsByPeriodId(handle, applicationPeriodId)
    },

    async submitApplication(handle, userId, data) {
      const submission = CommitteeApplicationSubmitSchema.parse(data)
      const applicationPeriod = await lockPeriod(handle, submission.applicationPeriodId)
      const existingApplication = await repository.findApplicationByUserAndPeriod(handle, userId, applicationPeriod.id)
      if (existingApplication !== null) {
        return existingApplication
      }
      validateApplication(
        submission,
        applicationPeriod,
        await repository.findManyGroupsByPeriodId(handle, applicationPeriod.id),
        new Date()
      )
      return repository.submitApplication(handle, userId, submission)
    },
    async updateApplication(handle, userId, applicationId, data) {
      const update = CommitteeApplicationUpdateSchema.parse(data)
      const application = await this.getApplicationById(handle, applicationId)
      if (application.userId !== userId) {
        throw new NotFoundError(`CommitteeApplication(ID=${applicationId}) not found`)
      }
      const applicationPeriod = await lockPeriod(handle, application.applicationPeriodId)
      validateApplication(
        update,
        applicationPeriod,
        await repository.findManyGroupsByPeriodId(handle, applicationPeriod.id),
        new Date()
      )
      return repository.updateApplication(handle, applicationId, update)
    },
    async getApplicationById(handle, applicationId) {
      const application = await repository.findApplicationById(handle, applicationId)
      if (application === null) {
        throw new NotFoundError(`CommitteeApplication(ID=${applicationId}) not found`)
      }
      return application
    },
    async findApplicationByUserAndPeriod(handle, userId, applicationPeriodId) {
      return repository.findApplicationByUserAndPeriod(handle, userId, applicationPeriodId)
    },
    async findManyApplicationsByPeriodId(handle, applicationPeriodId, page) {
      await this.getPeriodById(handle, applicationPeriodId)
      return repository.findManyApplicationsByPeriodId(handle, applicationPeriodId, page)
    },
    async findApplicantView(handle, userId, applicationPeriodId) {
      return repository.findApplicantView(handle, userId, applicationPeriodId)
    },
    async getApplicantDetailsById(handle, applicationId) {
      const applicantDetails = await repository.findApplicantDetailsById(handle, applicationId)
      if (applicantDetails === null) {
        throw new NotFoundError(`CommitteeApplication(ID=${applicationId}) not found`)
      }
      return applicantDetails
    },
    async setInterviewAttendance(handle, applicationId, applicationGroupId, userId, isAttending) {
      const isUpdated = await repository.setInterviewAttendance(
        handle,
        applicationId,
        applicationGroupId,
        userId,
        isAttending
      )
      if (!isUpdated) {
        throw new NotFoundError(
          `CommitteeApplicationGroupSelection(CommitteeApplicationID=${applicationId}, ApplicationGroupID=${applicationGroupId}) not found`
        )
      }
    },

    async setInterviewBlocks(handle, applicationGroupId, data) {
      const configuration = CommitteeApplicationInterviewBlocksSetSchema.parse(data)
      const blocks = configuration.interviewBlocks
      const applicationGroup = await this.getApplicationGroupById(handle, applicationGroupId)
      const applicationPeriod = await lockPeriod(handle, applicationGroup.applicationPeriodId)
      requireUnpublishedSchedule(applicationPeriod)
      if (
        new Set(blocks.map((block) => block.id)).size !== blocks.length ||
        !blocks.every(
          (block) =>
            isInterviewAvailabilityValid(block, applicationPeriod) &&
            hasValidMazemapRoom(block.locationName, block.locationUrl)
        )
      ) {
        throw new InvalidArgumentError(
          "Interview blocks need unique IDs, valid rooms and times within the interview window"
        )
      }
      for (const block of blocks) {
        const existingBlock = await repository.findInterviewBlockById(handle, block.id)
        if (existingBlock !== null && existingBlock.applicationGroupId !== applicationGroupId) {
          throw new InvalidArgumentError("The interview block belongs to another committee")
        }
      }
      await repository.replaceInterviews(handle, applicationPeriod.id, [])
      await repository.updateGroup(handle, applicationGroupId, {
        groupId: applicationGroup.groupId,
        type: applicationGroup.type,
        interviewDuration: configuration.interviewDuration,
      })
      await repository.setInterviewBlocks(handle, applicationGroupId, blocks)
      return repository.findManyInterviewBlocksByGroupId(handle, applicationGroupId)
    },
    async findManyInterviewBlocksByGroupId(handle, applicationGroupId) {
      await this.getApplicationGroupById(handle, applicationGroupId)
      return repository.findManyInterviewBlocksByGroupId(handle, applicationGroupId)
    },

    async generateInterviews(handle, applicationPeriodId) {
      const applicationPeriod = await lockPeriod(handle, applicationPeriodId)
      requireUnpublishedSchedule(applicationPeriod)
      requireClosedApplications(applicationPeriod, new Date())
      if (interviewMatcher === undefined) {
        throw new IllegalStateError("Interview matching is not configured")
      }
      const input = await getMatchingInput(handle, applicationPeriodId)
      const result = await interviewMatcher(input)
      for (const assignment of result.interviews) {
        validateInterviewAssignment(
          applicationPeriod,
          input,
          assignment,
          result.interviews.filter((candidate) => candidate !== assignment)
        )
      }
      await repository.replaceInterviews(handle, applicationPeriodId, result.interviews)
      return this.getInterviewSchedule(handle, applicationPeriodId)
    },
    async clearInterviews(handle, applicationPeriodId) {
      requireUnpublishedSchedule(await lockPeriod(handle, applicationPeriodId))
      await repository.replaceInterviews(handle, applicationPeriodId, [])
    },
    async confirmInterviews(handle, applicationPeriodId) {
      const applicationPeriod = await lockPeriod(handle, applicationPeriodId)
      if (applicationPeriod.interviewsPublishedAt !== null) {
        return applicationPeriod
      }
      requireClosedApplications(applicationPeriod, new Date())
      const interviews = await repository.findManyInterviewsByPeriodId(handle, applicationPeriodId)
      if (interviews.length === 0) {
        throw new IllegalStateError("There are no interviews to publish")
      }
      const input = await getMatchingInput(handle, applicationPeriodId)
      for (const interview of interviews) {
        validateInterviewAssignment(
          applicationPeriod,
          input,
          interview,
          interviews.filter((candidate) => candidate.id !== interview.id)
        )
      }
      return repository.setInterviewsPublishedAt(handle, applicationPeriodId, new Date())
    },
    async getInterviewSchedule(handle, applicationPeriodId) {
      const applicationPeriod = await this.getPeriodById(handle, applicationPeriodId)
      const groups = await repository.findManyGroupMatchingsByPeriodId(handle, applicationPeriodId)
      return {
        applicationPeriodId,
        interviewsPublishedAt: applicationPeriod.interviewsPublishedAt,
        groups,
        totalWantedInterviews: groups.reduce((total, group) => total + group.totalApplicants, 0),
        matchedInterviews: groups.reduce((total, group) => total + group.matchedApplicants, 0),
      }
    },

    async scheduleInterview(handle, groupSelectionId, data) {
      const placement = CommitteeApplicationInterviewPlacementSchema.parse(data)
      const selection = await repository.findGroupSelectionById(handle, groupSelectionId)
      if (selection === null) {
        throw new NotFoundError(`CommitteeApplicationGroupSelection(ID=${groupSelectionId}) not found`)
      }
      const applicationPeriod = await lockPeriod(handle, selection.applicationPeriodId)
      requireClosedApplications(applicationPeriod, new Date())
      const assignment = { ...placement, groupSelectionId, applicationGroupId: selection.applicationGroupId }
      if (!isInterviewAvailabilityValid(assignment, applicationPeriod)) {
        throw new InvalidArgumentError("The interview must be within the interview window")
      }
      validateInterviewAssignment(
        applicationPeriod,
        await getMatchingInput(handle, selection.applicationPeriodId),
        assignment,
        await repository.findManyInterviewsByPeriodId(handle, selection.applicationPeriodId)
      )
      return repository.createInterview(handle, assignment)
    },
    async rescheduleInterview(handle, interviewId, data) {
      const placement = CommitteeApplicationInterviewPlacementSchema.parse(data)
      const interview = await this.getInterviewById(handle, interviewId)
      const selection = await repository.findGroupSelectionById(handle, interview.groupSelectionId)
      if (selection === null) {
        throw new NotFoundError("The interview's selection was not found")
      }
      const applicationPeriod = await lockPeriod(handle, selection.applicationPeriodId)
      const assignment = { ...interview, ...placement }
      if (!isInterviewAvailabilityValid(assignment, applicationPeriod)) {
        throw new InvalidArgumentError("The interview must be within the interview window")
      }
      const interviews = await repository.findManyInterviewsByPeriodId(handle, selection.applicationPeriodId)
      validateInterviewAssignment(
        applicationPeriod,
        await getMatchingInput(handle, selection.applicationPeriodId),
        assignment,
        interviews.filter((candidate) => candidate.id !== interviewId)
      )
      return repository.updateInterview(handle, interviewId, {
        startsAt: assignment.startsAt,
        endsAt: assignment.endsAt,
        interviewBlockId: assignment.interviewBlockId,
        applicationGroupId: interview.applicationGroupId,
        groupSelectionId: interview.groupSelectionId,
      })
    },
    async cancelInterview(handle, interviewId) {
      const interview = await this.getInterviewById(handle, interviewId)
      const selection = await repository.findGroupSelectionById(handle, interview.groupSelectionId)
      if (selection === null) {
        throw new NotFoundError("The interview's selection was not found")
      }
      await lockPeriod(handle, selection.applicationPeriodId)
      await repository.deleteInterview(handle, interviewId)
    },
    async getInterviewById(handle, interviewId) {
      const interview = await repository.findInterviewById(handle, interviewId)
      if (interview === null) {
        throw new NotFoundError(`CommitteeApplicationInterview(ID=${interviewId}) not found`)
      }
      return interview
    },
  }
}
