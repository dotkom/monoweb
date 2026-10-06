import type { DBClient, DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import { FailedPreconditionError } from "../../error"
import { createTrpcContext, type Principal } from "../../trpc"
import type { ServiceLayer } from "../core"
import type {
  CommitteeApplication,
  CommitteeApplicationApplicantDetails,
  CommitteeApplicationGroup,
  CommitteeApplicationInterview,
  CommitteeApplicationInterviewSchedule,
  CommitteeApplicationPeriod,
} from "./committee-application"
import { committeeApplicationRouter } from "./committee-application-router"
import type {
  CommitteeApplicationInterviewProposal,
  CommitteeApplicationInterviewPublication,
  CommitteeApplicationService,
} from "./committee-application-service"

const timestamp = new Date("2026-10-12T12:00:00Z")
const period: CommitteeApplicationPeriod = {
  id: "period",
  name: "Committee applications",
  createdAt: timestamp,
  updatedAt: timestamp,
  isDraft: false,
  isEnabled: true,
  applicationsOpenAt: timestamp,
  applicationsCloseAt: timestamp,
  interviewsStartDate: timestamp,
  interviewsEndDate: timestamp,
  interviewsStartTime: "09:00",
  interviewsEndTime: "17:00",
  interviewsPublishedAt: null,
}
const schedule: CommitteeApplicationInterviewSchedule = {
  applicationPeriodId: period.id,
  interviewsPublishedAt: null,
  totalWantedInterviews: 0,
  matchedInterviews: 0,
  groups: [],
}

const applicationGroup: CommitteeApplicationGroup = {
  id: "application-group",
  applicationPeriodId: period.id,
  groupId: "appkom",
  type: "EXCLUSIVE",
  interviewDuration: "MINUTES_30",
  createdAt: timestamp,
  updatedAt: timestamp,
}
const application: CommitteeApplication = {
  id: "application",
  applicationPeriodId: period.id,
  userId: "current-user",
  aboutMe: "My application",
  studyYear: 2,
  groupSelections: [],
  availabilityBlocks: [],
  createdAt: timestamp,
  updatedAt: timestamp,
}
const applicantDetails: CommitteeApplicationApplicantDetails = {
  applicationId: application.id,
  name: "Applicant",
  email: "applicant@example.com",
  phone: null,
  studyYear: 2,
  aboutMe: application.aboutMe,
  createdAt: timestamp,
  availability: [],
  groupSelections: [
    { applicationGroupId: applicationGroup.id, groupId: "appkom", rank: 1, interview: null },
    { applicationGroupId: "other-application-group", groupId: "bedkom", rank: 2, interview: null },
  ],
}
const periodInput = { applicationPeriodId: period.id }
const applicationGroupInput = { applicationGroupId: applicationGroup.id }
const applicationInput = { applicationId: application.id }
const interviewInput = { interviewId: "interview" }
const interviewPlacement = {
  interviewBlockId: "block",
  startsAt: timestamp,
  endsAt: new Date(timestamp.getTime() + 30 * 60_000),
}
const interview: CommitteeApplicationInterview = {
  ...interviewPlacement,
  id: interviewInput.interviewId,
  groupSelectionId: "selection",
  applicationGroupId: applicationGroup.id,
  createdAt: timestamp,
  updatedAt: timestamp,
}
const applicationSubmission = {
  aboutMe: application.aboutMe,
  studyYear: 2,
  groupSelections: [{ applicationGroupId: applicationGroup.id, rank: 1 }],
  interviewAvailability: [{ startsAt: interviewPlacement.startsAt, endsAt: interviewPlacement.endsAt }],
}

type CommitteeApplicationCaller = ReturnType<typeof committeeApplicationRouter.createCaller>

const administratorRequests: {
  name: string
  perform: (caller: CommitteeApplicationCaller) => Promise<unknown>
  serviceMethod: keyof CommitteeApplicationService
}[] = [
  {
    name: "createPeriod",
    perform: (caller) => {
      return caller.createPeriod({
        applicationPeriod: period,
        groups: [{ groupId: applicationGroup.groupId, type: applicationGroup.type }],
      })
    },
    serviceMethod: "createPeriod",
  },
  {
    name: "deletePeriod",
    perform: (caller) => {
      return caller.deletePeriod(periodInput)
    },
    serviceMethod: "deletePeriod",
  },
  {
    name: "getPeriodById",
    perform: (caller) => {
      return caller.getPeriodById(periodInput)
    },
    serviceMethod: "getPeriodById",
  },
  {
    name: "findManyPeriods",
    perform: (caller) => {
      return caller.findManyPeriods()
    },
    serviceMethod: "findManyPeriods",
  },
  {
    name: "updatePeriod",
    perform: (caller) => {
      return caller.updatePeriod({ ...periodInput, applicationPeriod: { name: "Updated period" } })
    },
    serviceMethod: "updatePeriod",
  },
  {
    name: "findManyGroups",
    perform: (caller) => {
      return caller.findManyGroups(periodInput)
    },
    serviceMethod: "findManyGroupsByPeriodId",
  },
  {
    name: "getApplicationGroupById",
    perform: (caller) => {
      return caller.getApplicationGroupById(applicationGroupInput)
    },
    serviceMethod: "getApplicationGroupById",
  },
  {
    name: "getApplicationById",
    perform: (caller) => {
      return caller.getApplicationById(applicationInput)
    },
    serviceMethod: "getApplicationById",
  },
  {
    name: "findManyApplicationsByPeriodId",
    perform: (caller) => {
      return caller.findManyApplicationsByPeriodId(periodInput)
    },
    serviceMethod: "findManyApplicationsByPeriodId",
  },
  {
    name: "findManyInterviewBlocks",
    perform: (caller) => {
      return caller.findManyInterviewBlocks(applicationGroupInput)
    },
    serviceMethod: "findManyInterviewBlocksByGroupId",
  },
  {
    name: "setInterviewBlocks",
    perform: (caller) => {
      return caller.setInterviewBlocks({
        ...applicationGroupInput,
        interviewDuration: "MINUTES_30",
        interviewBlocks: [],
      })
    },
    serviceMethod: "setInterviewBlocks",
  },
  {
    name: "scheduleInterview",
    perform: (caller) => {
      return caller.scheduleInterview({ groupSelectionId: "selection", interview: interviewPlacement })
    },
    serviceMethod: "scheduleInterview",
  },
  {
    name: "cancelInterview",
    perform: (caller) => {
      return caller.cancelInterview(interviewInput)
    },
    serviceMethod: "cancelInterview",
  },
  {
    name: "getInterviewById",
    perform: (caller) => {
      return caller.getInterviewById(interviewInput)
    },
    serviceMethod: "getInterviewById",
  },
  {
    name: "rescheduleInterview",
    perform: (caller) => {
      return caller.rescheduleInterview({ ...interviewInput, interview: interviewPlacement })
    },
    serviceMethod: "rescheduleInterview",
  },
  {
    name: "generateInterviews",
    perform: (caller) => {
      return caller.generateInterviews(periodInput)
    },
    serviceMethod: "generateInterviews",
  },
  {
    name: "clearInterviews",
    perform: (caller) => {
      return caller.clearInterviews(periodInput)
    },
    serviceMethod: "clearInterviews",
  },
  {
    name: "getInterviewSchedule",
    perform: (caller) => {
      return caller.getInterviewSchedule(periodInput)
    },
    serviceMethod: "getInterviewSchedule",
  },
  {
    name: "findManyGroupMatchings",
    perform: (caller) => {
      return caller.findManyGroupMatchings(periodInput)
    },
    serviceMethod: "getInterviewSchedule",
  },
  {
    name: "confirmInterviews",
    perform: (caller) => {
      return caller.confirmInterviews(periodInput)
    },
    serviceMethod: "prepareInterviewPublication",
  },
  {
    name: "revertInterviewPublicationAndMatching",
    perform: (caller) => {
      return caller.revertInterviewPublicationAndMatching(periodInput)
    },
    serviceMethod: "revertInterviewPublicationAndMatching",
  },
]

function principalWithGroups(groupIds: string[]): Principal {
  return {
    subject: "current-user",
    affiliations: new Map(groupIds.map((groupId) => [groupId, new Set()])),
    scopes: new Set(),
  }
}

async function setup(principal: Principal | null = principalWithGroups(["dotkom"])) {
  const prisma = mockDeep<DBClient>()
  const transactionHandle = mockDeep<DBHandle>()
  const service = mockDeep<CommitteeApplicationService>()
  let isInTransaction = false

  service.createPeriod.mockResolvedValue(period)
  service.getPeriodById.mockResolvedValue(period)
  service.findManyPeriods.mockResolvedValue([period])
  service.updatePeriod.mockResolvedValue(period)
  service.findManyGroupsByPeriodId.mockResolvedValue([])
  service.getApplicationGroupById.mockResolvedValue(applicationGroup)
  service.getApplicationById.mockResolvedValue(application)
  service.findManyApplicationsByPeriodId.mockResolvedValue([application])
  service.findManyInterviewBlocksByGroupId.mockResolvedValue([])
  service.setInterviewBlocks.mockResolvedValue([])
  service.scheduleInterview.mockResolvedValue(interview)
  service.getInterviewById.mockResolvedValue(interview)
  service.rescheduleInterview.mockResolvedValue(interview)
  service.generateInterviews.mockResolvedValue(mock())
  service.saveGeneratedInterviews.mockResolvedValue(schedule)
  service.getInterviewSchedule.mockResolvedValue(schedule)
  service.prepareInterviewPublication.mockResolvedValue(mock())
  service.confirmInterviews.mockResolvedValue({ ...period, interviewsPublishedAt: timestamp })
  service.revertInterviewPublicationAndMatching.mockResolvedValue(period)

  transactionHandle.auditTransaction.create.mockResolvedValue(mock({ id: "audit" }))
  prisma.$transaction.mockImplementation(async (callback) => {
    isInTransaction = true

    try {
      return await callback(transactionHandle)
    } finally {
      isInTransaction = false
    }
  })

  const context = await createTrpcContext(
    principal,
    { ...mock<ServiceLayer>(), prisma, committeeApplicationService: service },
    "test"
  )

  return {
    caller: committeeApplicationRouter.createCaller(context),
    prisma,
    transactionHandle,
    service,
    isInTransaction: () => isInTransaction,
  }
}

describe("interview matching transaction boundaries", () => {
  it("finishes read-only generation before opening the audited save transaction", async () => {
    const { caller, prisma, transactionHandle, service, isInTransaction } = await setup()
    const started = Promise.withResolvers<void>()
    const computation = Promise.withResolvers<CommitteeApplicationInterviewProposal>()
    const proposal = mock<CommitteeApplicationInterviewProposal>()

    service.generateInterviews.mockImplementation(async (handle) => {
      started.resolve()
      expect(handle).toBe(prisma)
      expect(isInTransaction()).toBe(false)

      return computation.promise
    })
    service.saveGeneratedInterviews.mockImplementation(async (handle, applicationPeriodId, receivedProposal) => {
      expect(handle).toBe(transactionHandle)
      expect(applicationPeriodId).toBe(period.id)
      expect(receivedProposal).toBe(proposal)
      expect(isInTransaction()).toBe(true)

      return schedule
    })

    const pendingSchedule = caller.generateInterviews({ applicationPeriodId: period.id })

    await started.promise

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(transactionHandle.auditTransaction.create).not.toHaveBeenCalled()

    computation.resolve(proposal)

    await expect(pendingSchedule).resolves.toEqual(schedule)

    expect(prisma.$transaction).toHaveBeenCalledExactlyOnceWith(expect.any(Function), {
      isolationLevel: "ReadCommitted",
    })
    expect(transactionHandle.auditTransaction.update).toHaveBeenCalledWith({
      where: {
        id: "audit",
      },
      data: {
        name: `Generate CommitteeApplicationInterviews(ApplicationPeriodID=${period.id})`,
      },
    })
  })

  it("finishes the fresh publication check before opening the audited publication transaction", async () => {
    const { caller, prisma, transactionHandle, service, isInTransaction } = await setup()
    const started = Promise.withResolvers<void>()
    const computation = Promise.withResolvers<CommitteeApplicationInterviewPublication | null>()
    const proposal = mock<CommitteeApplicationInterviewPublication>()
    const publishedPeriod = { ...period, interviewsPublishedAt: timestamp }

    service.prepareInterviewPublication.mockImplementation(async (handle) => {
      started.resolve()
      expect(handle).toBe(prisma)
      expect(isInTransaction()).toBe(false)

      return computation.promise
    })
    service.confirmInterviews.mockImplementation(async (handle, applicationPeriodId, receivedProposal) => {
      expect(handle).toBe(transactionHandle)
      expect(applicationPeriodId).toBe(period.id)
      expect(receivedProposal).toBe(proposal)
      expect(isInTransaction()).toBe(true)

      return publishedPeriod
    })

    const pendingPeriod = caller.confirmInterviews({ applicationPeriodId: period.id })

    await started.promise

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(transactionHandle.auditTransaction.create).not.toHaveBeenCalled()

    computation.resolve(proposal)

    await expect(pendingPeriod).resolves.toEqual(publishedPeriod)

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(transactionHandle.auditTransaction.update).toHaveBeenCalledWith({
      where: {
        id: "audit",
      },
      data: {
        name: `Publish CommitteeApplicationInterviews(ApplicationPeriodID=${period.id})`,
      },
    })
  })

  it.each(["generate", "publish"])("does not open a transaction when %s preparation fails", async (operation) => {
    const { caller, prisma, service } = await setup()
    const error = new FailedPreconditionError("The draft needs review")

    service.generateInterviews.mockRejectedValue(error)
    service.prepareInterviewPublication.mockRejectedValue(error)

    const result =
      operation === "generate"
        ? caller.generateInterviews({ applicationPeriodId: period.id })
        : caller.confirmInterviews({ applicationPeriodId: period.id })

    await expect(result).rejects.toMatchObject({ code: "PRECONDITION_FAILED" })

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(service.saveGeneratedInterviews).not.toHaveBeenCalled()
    expect(service.confirmInterviews).not.toHaveBeenCalled()
  })

  it("propagates stale-proposal rejection without recording a successful save", async () => {
    const { caller, transactionHandle, service } = await setup()

    service.generateInterviews.mockResolvedValue(mock())
    service.saveGeneratedInterviews.mockRejectedValue(new FailedPreconditionError("The inputs changed"))

    await expect(caller.generateInterviews({ applicationPeriodId: period.id })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    })

    expect(transactionHandle.auditTransaction.update).not.toHaveBeenCalled()
  })

  it("reads public and administrator views without opening transactions", async () => {
    const { caller, prisma, service } = await setup()

    service.findOpenPeriod.mockResolvedValue(null)
    service.getPeriodById.mockResolvedValue(period)
    service.getInterviewSchedule.mockResolvedValue(schedule)

    await expect(caller.findOpenPeriod()).resolves.toBeNull()
    await expect(caller.getPeriodById({ applicationPeriodId: period.id })).resolves.toEqual(period)
    await expect(caller.getInterviewSchedule({ applicationPeriodId: period.id })).resolves.toEqual(schedule)

    expect(service.findOpenPeriod).toHaveBeenCalledWith(prisma)
    expect(service.getPeriodById).toHaveBeenCalledWith(prisma, period.id)
    expect(service.getInterviewSchedule).toHaveBeenCalledWith(prisma, period.id)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

describe.each(administratorRequests)("authorization for $name", ({ perform, serviceMethod }) => {
  it.each(["dotkom", "hs"])("allows %s to perform the use case", async (groupId) => {
    const { caller, service } = await setup(principalWithGroups([groupId]))

    await perform(caller)

    expect(service[serviceMethod]).toHaveBeenCalledTimes(1)
  })

  it.each([
    { description: "anonymous callers", principal: null, code: "UNAUTHORIZED" },
    { description: "applicants", principal: principalWithGroups([]), code: "FORBIDDEN" },
    { description: "committee members", principal: principalWithGroups(["appkom"]), code: "FORBIDDEN" },
    { description: "interest group members", principal: principalWithGroups(["interest-group"]), code: "FORBIDDEN" },
  ])("rejects $description before calling the service or opening a transaction", async ({ principal, code }) => {
    const { caller, prisma, service } = await setup(principal)

    await expect(perform(caller)).rejects.toMatchObject({ code })

    expect(service[serviceMethod]).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

describe("applicant details authorization", () => {
  it.each([
    { groupIds: [] },
    { groupIds: ["interest-group"] },
  ])("rejects $groupIds before loading private details", async ({ groupIds }) => {
    const { caller, service } = await setup(principalWithGroups(groupIds))

    await expect(caller.getApplicantDetails(applicationInput)).rejects.toMatchObject({ code: "FORBIDDEN" })

    expect(service.getApplicantDetailsById).not.toHaveBeenCalled()
  })

  it.each(["appkom", "bedkom", "dotkom", "hs"])("allows %s to view a selected applicant", async (groupId) => {
    const { caller, prisma, service } = await setup(principalWithGroups([groupId]))

    service.getApplicantDetailsById.mockResolvedValue(applicantDetails)

    await expect(caller.getApplicantDetails(applicationInput)).resolves.toEqual(applicantDetails)

    expect(service.getApplicantDetailsById).toHaveBeenCalledWith(prisma, application.id)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it.each([
    { groupIds: [] },
    { groupIds: ["arrkom"] },
    { groupIds: ["interest-group"] },
  ])("rejects unrelated affiliations $groupIds", async ({ groupIds }) => {
    const { caller, service } = await setup(principalWithGroups(groupIds))

    service.getApplicantDetailsById.mockResolvedValue(applicantDetails)

    await expect(caller.getApplicantDetails(applicationInput)).rejects.toMatchObject({ code: "FORBIDDEN" })
  })

  it("rejects anonymous callers before loading private applicant details", async () => {
    const { caller, service } = await setup(null)

    await expect(caller.getApplicantDetails(applicationInput)).rejects.toMatchObject({ code: "UNAUTHORIZED" })

    expect(service.getApplicantDetailsById).not.toHaveBeenCalled()
  })
})

describe("interviewer signup authorization", () => {
  it.each([
    { groupIds: [] },
    { groupIds: ["interest-group"] },
  ])("rejects $groupIds before opening a signup transaction", async ({ groupIds }) => {
    const { caller, prisma, service } = await setup(principalWithGroups(groupIds))

    await expect(
      caller.setInterviewAttendance({ ...applicationInput, ...applicationGroupInput, isAttending: true })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })

    expect(service.getApplicationGroupById).not.toHaveBeenCalled()
    expect(service.setInterviewAttendance).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it.each(["appkom", "dotkom", "hs"])("allows %s to add and remove their own signup", async (groupId) => {
    const { caller, service, transactionHandle } = await setup(principalWithGroups([groupId]))

    service.getApplicationGroupById.mockResolvedValue(applicationGroup)

    for (const isAttending of [true, false]) {
      const signup = {
        ...applicationInput,
        ...applicationGroupInput,
        userId: "another-user",
        isAttending,
      }

      await caller.setInterviewAttendance(signup)

      expect(service.setInterviewAttendance).toHaveBeenLastCalledWith(
        transactionHandle,
        application.id,
        applicationGroup.id,
        "current-user",
        isAttending
      )
    }

    expect(service.getApplicationGroupById).toHaveBeenCalledWith(transactionHandle, applicationGroup.id)
  })

  it.each([
    { groupIds: [] },
    { groupIds: ["bedkom"] },
    { groupIds: ["interest-group"] },
  ])("rejects unrelated affiliations $groupIds before changing a signup", async ({ groupIds }) => {
    const { caller, service } = await setup(principalWithGroups(groupIds))

    service.getApplicationGroupById.mockResolvedValue(applicationGroup)

    for (const isAttending of [true, false]) {
      await expect(
        caller.setInterviewAttendance({ ...applicationInput, ...applicationGroupInput, isAttending })
      ).rejects.toMatchObject({ code: "FORBIDDEN" })
    }

    expect(service.setInterviewAttendance).not.toHaveBeenCalled()
  })

  it("rejects anonymous callers before opening a transaction", async () => {
    const { caller, prisma, service } = await setup(null)

    await expect(
      caller.setInterviewAttendance({ ...applicationInput, ...applicationGroupInput, isAttending: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" })

    expect(service.getApplicationGroupById).not.toHaveBeenCalled()
    expect(service.setInterviewAttendance).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

describe("applicant self-service authorization", () => {
  it("allows anonymous callers to find the open period", async () => {
    const { caller, service, prisma } = await setup(null)

    service.findOpenPeriod.mockResolvedValue(null)

    await expect(caller.findOpenPeriod()).resolves.toBeNull()

    expect(service.findOpenPeriod).toHaveBeenCalledWith(prisma)
  })

  it("uses the signed-in applicant for submission, updates, and their application view", async () => {
    const { caller, prisma, transactionHandle, service } = await setup(principalWithGroups([]))
    const submission = { ...applicationSubmission, ...periodInput, userId: "another-user" }
    const viewInput = { ...periodInput, userId: "another-user" }

    service.submitApplication.mockResolvedValue(application)
    service.updateApplication.mockResolvedValue(application)
    service.findApplicantView.mockResolvedValue(null)

    await expect(caller.submitApplication(submission)).resolves.toEqual(application)
    await expect(
      caller.updateApplication({ ...applicationInput, application: applicationSubmission })
    ).resolves.toEqual(application)
    await expect(caller.findMyApplication(viewInput)).resolves.toBeNull()

    expect(service.submitApplication).toHaveBeenCalledWith(transactionHandle, "current-user", {
      ...applicationSubmission,
      ...periodInput,
    })
    expect(service.updateApplication).toHaveBeenCalledWith(
      transactionHandle,
      "current-user",
      application.id,
      applicationSubmission
    )
    expect(service.findApplicantView).toHaveBeenCalledWith(prisma, "current-user", period.id)
  })

  it("rejects anonymous self-service requests before calling the service", async () => {
    const { caller, prisma, service } = await setup(null)

    await expect(caller.submitApplication({ ...applicationSubmission, ...periodInput })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    })
    await expect(
      caller.updateApplication({ ...applicationInput, application: applicationSubmission })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" })
    await expect(caller.findMyApplication(periodInput)).rejects.toMatchObject({ code: "UNAUTHORIZED" })

    expect(service.submitApplication).not.toHaveBeenCalled()
    expect(service.updateApplication).not.toHaveBeenCalled()
    expect(service.findApplicantView).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
