import { PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { permitIf } from "../../authorization"
import {
  createAuditedDatabaseTransaction,
  withAuditLogEntry,
  withAuthentication,
  withAuthorization,
  withDatabaseTransaction,
} from "../../middlewares"
import {
  canCreateCommitteeApplicationPeriod,
  canDeleteCommitteeApplicationPeriod,
  canViewCommitteeApplicationPeriods,
  canUpdateCommitteeApplicationPeriod,
  canViewCommitteeApplications,
  canInterviewCommitteeApplicationApplicants,
  canViewCommitteeApplicationApplicantDetails,
  canSetCommitteeApplicationInterviewAttendance,
  canViewCommitteeApplicationInterviewBlocks,
  canSetCommitteeApplicationInterviewBlocks,
  canScheduleCommitteeApplicationInterview,
  canCancelCommitteeApplicationInterview,
  canViewCommitteeApplicationInterview,
  canRescheduleCommitteeApplicationInterview,
  canGenerateCommitteeApplicationInterviews,
  canClearCommitteeApplicationInterviews,
  canViewCommitteeApplicationInterviewSchedule,
  canConfirmCommitteeApplicationInterviews,
  canRevertCommitteeApplicationInterviewPublication,
} from "../../permissions/committee-application-permissions"
import { procedure, t } from "../../trpc"
import {
  CommitteeApplicationApplicantDetailsSchema,
  CommitteeApplicationPeriodSchema,
  CommitteeApplicationPeriodCreateSchema,
  CommitteeApplicationPeriodUpdateSchema,
  CommitteeApplicationGroupSchema,
  CommitteeApplicationGroupStatusSchema,
  CommitteeApplicationGroupMatchingSchema,
  CommitteeApplicationOpenPeriodSchema,
  CommitteeApplicationApplicantViewSchema,
  CommitteeApplicationSchema,
  CommitteeApplicationSubmitSchema,
  CommitteeApplicationUpdateSchema,
  CommitteeApplicationInterviewBlockSchema,
  CommitteeApplicationInterviewBlocksSetSchema,
  CommitteeApplicationInterviewScheduleSchema,
  CommitteeApplicationInterviewSchema,
  CommitteeApplicationInterviewPlacementSchema,
  CommitteeApplicationGroupSelectionSchema,
} from "./committee-application"

const applicationPeriodInputSchema = z.object({ applicationPeriodId: CommitteeApplicationPeriodSchema.shape.id })
const applicationGroupInputSchema = z.object({ applicationGroupId: CommitteeApplicationGroupSchema.shape.id })
const applicantInputSchema = z.object({ applicationId: CommitteeApplicationSchema.shape.id })
const groupSelectionInputSchema = applicantInputSchema.extend(applicationGroupInputSchema.shape)
const interviewInputSchema = z.object({ interviewId: CommitteeApplicationInterviewSchema.shape.id })

export type CreateCommitteeApplicationPeriodInput = inferProcedureInput<typeof createPeriodProcedure>
export type CreateCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof createPeriodProcedure>
const createPeriodProcedure = procedure
  .input(CommitteeApplicationPeriodCreateSchema)
  .output(CommitteeApplicationPeriodSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canCreateCommitteeApplicationPeriod(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const applicationPeriod = await context.committeeApplicationService.createPeriod(context.handle, input)

    context.setAuditTransactionName(
      `Create CommitteeApplicationPeriod(ID=${applicationPeriod.id},Name=${applicationPeriod.name})`
    )

    return applicationPeriod
  })

export type DeleteCommitteeApplicationPeriodInput = inferProcedureInput<typeof deletePeriodProcedure>
const deletePeriodProcedure = procedure
  .input(applicationPeriodInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canDeleteCommitteeApplicationPeriod(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.deletePeriod(context.handle, input.applicationPeriodId)

    context.setAuditTransactionName(`Delete CommitteeApplicationPeriod(ID=${input.applicationPeriodId})`)
  })

export type GetCommitteeApplicationPeriodByIdInput = inferProcedureInput<typeof getPeriodByIdProcedure>
export type GetCommitteeApplicationPeriodByIdOutput = inferProcedureOutput<typeof getPeriodByIdProcedure>
const getPeriodByIdProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationPeriods(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.getPeriodById(context.prisma, input.applicationPeriodId)
  })

export type FindManyCommitteeApplicationPeriodsInput = inferProcedureInput<typeof findManyPeriodsProcedure>
export type FindManyCommitteeApplicationPeriodsOutput = inferProcedureOutput<typeof findManyPeriodsProcedure>
const findManyPeriodsProcedure = procedure
  .input(PaginateInputSchema)
  .output(CommitteeApplicationPeriodSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationPeriods(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.findManyPeriods(context.prisma, input)
  })

export type FindOpenCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof findOpenPeriodProcedure>
const findOpenPeriodProcedure = procedure
  .output(CommitteeApplicationOpenPeriodSchema.nullable())
  .query(({ ctx: context }) => {
    return context.committeeApplicationService.findOpenPeriod(context.prisma)
  })

export type UpdateCommitteeApplicationPeriodInput = inferProcedureInput<typeof updatePeriodProcedure>
export type UpdateCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof updatePeriodProcedure>
const updatePeriodProcedure = procedure
  .input(CommitteeApplicationPeriodUpdateSchema.extend(applicationPeriodInputSchema.shape))
  .output(CommitteeApplicationPeriodSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canUpdateCommitteeApplicationPeriod(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const applicationPeriod = await context.committeeApplicationService.updatePeriod(
      context.handle,
      input.applicationPeriodId,
      input
    )

    context.setAuditTransactionName(
      `Update CommitteeApplicationPeriod(ID=${applicationPeriod.id},Name=${applicationPeriod.name})`
    )

    return applicationPeriod
  })

export type FindManyCommitteeApplicationGroupsInput = inferProcedureInput<typeof findManyGroupsProcedure>
export type FindManyCommitteeApplicationGroupsOutput = inferProcedureOutput<typeof findManyGroupsProcedure>
const findManyGroupsProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationGroupStatusSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationPeriods(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.findManyGroupsByPeriodId(context.prisma, input.applicationPeriodId)
  })

const getApplicationGroupByIdProcedure = procedure
  .input(applicationGroupInputSchema)
  .output(CommitteeApplicationGroupSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationPeriods(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.getApplicationGroupById(context.prisma, input.applicationGroupId)
  })

const submitApplicationProcedure = procedure
  .input(CommitteeApplicationSubmitSchema)
  .output(CommitteeApplicationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(({ ctx: context, input }) => {
    return context.committeeApplicationService.submitApplication(context.handle, context.principal.subject, input)
  })

const getApplicationByIdProcedure = procedure
  .input(applicantInputSchema)
  .output(CommitteeApplicationSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplications(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.getApplicationById(context.prisma, input.applicationId)
  })

const findManyApplicationsByPeriodIdProcedure = procedure
  .input(applicationPeriodInputSchema.extend({ page: PaginateInputSchema }))
  .output(CommitteeApplicationSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplications(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.findManyApplicationsByPeriodId(
      context.prisma,
      input.applicationPeriodId,
      input.page
    )
  })

const findMyApplicationProcedure = procedure
  .input(z.object({ applicationPeriodId: CommitteeApplicationPeriodSchema.shape.id.optional() }).optional())
  .output(CommitteeApplicationApplicantViewSchema.nullable())
  .use(withAuthentication())
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.findApplicantView(
      context.prisma,
      context.principal.subject,
      input?.applicationPeriodId
    )
  })

export type GetCommitteeApplicationApplicantDetailsInput = inferProcedureInput<typeof getApplicantDetailsProcedure>
export type GetCommitteeApplicationApplicantDetailsOutput = inferProcedureOutput<typeof getApplicantDetailsProcedure>
const getApplicantDetailsProcedure = procedure
  .input(applicantInputSchema)
  .output(CommitteeApplicationApplicantDetailsSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canInterviewCommitteeApplicationApplicants(principal))))
  .query(async ({ ctx: context, input }) => {
    const applicantDetails = await context.committeeApplicationService.getApplicantDetailsById(
      context.prisma,
      input.applicationId
    )

    const selectedGroupIds = applicantDetails.groupSelections.map((selection) => selection.groupId)

    await context.addAuthorizationGuard(
      permitIf((principal) => canViewCommitteeApplicationApplicantDetails(principal, selectedGroupIds)),
      input
    )

    return applicantDetails
  })

const updateApplicationProcedure = procedure
  .input(
    z.object({ applicationId: CommitteeApplicationSchema.shape.id, application: CommitteeApplicationUpdateSchema })
  )
  .output(CommitteeApplicationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(({ ctx: context, input }) => {
    return context.committeeApplicationService.updateApplication(
      context.handle,
      context.principal.subject,
      input.applicationId,
      input.application
    )
  })

const setInterviewAttendanceProcedure = procedure
  .input(groupSelectionInputSchema.extend({ isAttending: z.boolean() }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canInterviewCommitteeApplicationApplicants(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const applicationGroup = await context.committeeApplicationService.getApplicationGroupById(
      context.handle,
      input.applicationGroupId
    )

    await context.addAuthorizationGuard(
      permitIf((principal) => canSetCommitteeApplicationInterviewAttendance(principal, applicationGroup.groupId)),
      input
    )

    await context.committeeApplicationService.setInterviewAttendance(
      context.handle,
      input.applicationId,
      input.applicationGroupId,
      context.principal.subject,
      input.isAttending
    )

    context.setAuditTransactionName(
      `Set CommitteeApplicationInterviewAttendance(CommitteeApplicationID=${input.applicationId},ApplicationGroupID=${input.applicationGroupId},IsAttending=${input.isAttending})`
    )
  })

export type FindManyCommitteeApplicationInterviewBlocksInput = inferProcedureInput<
  typeof findManyInterviewBlocksProcedure
>
export type FindManyCommitteeApplicationInterviewBlocksOutput = inferProcedureOutput<
  typeof findManyInterviewBlocksProcedure
>
const findManyInterviewBlocksProcedure = procedure
  .input(applicationGroupInputSchema)
  .output(CommitteeApplicationInterviewBlockSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationInterviewBlocks(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.findManyInterviewBlocksByGroupId(
      context.prisma,
      input.applicationGroupId
    )
  })

const setInterviewBlocksProcedure = procedure
  .input(applicationGroupInputSchema.extend(CommitteeApplicationInterviewBlocksSetSchema.shape))
  .output(CommitteeApplicationInterviewBlockSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canSetCommitteeApplicationInterviewBlocks(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const interviewBlocks = await context.committeeApplicationService.setInterviewBlocks(
      context.handle,
      input.applicationGroupId,
      input
    )

    context.setAuditTransactionName(
      `Set CommitteeApplicationInterviewBlocks(ApplicationGroupID=${input.applicationGroupId})`
    )

    return interviewBlocks
  })

const scheduleInterviewProcedure = procedure
  .input(
    z.object({
      groupSelectionId: CommitteeApplicationGroupSelectionSchema.shape.id,
      interview: CommitteeApplicationInterviewPlacementSchema,
    })
  )
  .output(CommitteeApplicationInterviewSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canScheduleCommitteeApplicationInterview(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const interview = await context.committeeApplicationService.scheduleInterview(
      context.handle,
      input.groupSelectionId,
      input.interview
    )

    context.setAuditTransactionName(`Schedule CommitteeApplicationInterview(ID=${interview.id})`)

    return interview
  })

const cancelInterviewProcedure = procedure
  .input(interviewInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canCancelCommitteeApplicationInterview(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.cancelInterview(context.handle, input.interviewId)

    context.setAuditTransactionName(`Cancel CommitteeApplicationInterview(ID=${input.interviewId})`)
  })

const getInterviewByIdProcedure = procedure
  .input(interviewInputSchema)
  .output(CommitteeApplicationInterviewSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationInterview(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.getInterviewById(context.prisma, input.interviewId)
  })

const rescheduleInterviewProcedure = procedure
  .input(interviewInputSchema.extend({ interview: CommitteeApplicationInterviewPlacementSchema }))
  .output(CommitteeApplicationInterviewSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canRescheduleCommitteeApplicationInterview(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const interview = await context.committeeApplicationService.rescheduleInterview(
      context.handle,
      input.interviewId,
      input.interview
    )

    context.setAuditTransactionName(`Reschedule CommitteeApplicationInterview(ID=${interview.id})`)

    return interview
  })

const generateInterviewsProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationInterviewScheduleSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canGenerateCommitteeApplicationInterviews(principal))))
  .mutation(async ({ ctx: context, input, path }) => {
    const proposal = await context.committeeApplicationService.generateInterviews(
      context.prisma,
      input.applicationPeriodId
    )
    const transaction = createAuditedDatabaseTransaction({
      prisma: context.prisma,
      principal: context.principal,
      procedure: path,
    })

    return transaction(async ({ handle, setAuditTransactionName }) => {
      const schedule = await context.committeeApplicationService.saveGeneratedInterviews(
        handle,
        input.applicationPeriodId,
        proposal
      )

      setAuditTransactionName(
        `Generate CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
      )

      return schedule
    })
  })

const clearInterviewsProcedure = procedure
  .input(applicationPeriodInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canClearCommitteeApplicationInterviews(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.clearInterviews(context.handle, input.applicationPeriodId)

    context.setAuditTransactionName(
      `Clear CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
    )
  })

const getInterviewScheduleProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationInterviewScheduleSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationInterviewSchedule(principal))))
  .query(({ ctx: context, input }) => {
    return context.committeeApplicationService.getInterviewSchedule(context.prisma, input.applicationPeriodId)
  })

export type FindManyCommitteeApplicationGroupSchedulesInput = inferProcedureInput<
  typeof findManyGroupMatchingsProcedure
>
export type FindManyCommitteeApplicationGroupSchedulesOutput = inferProcedureOutput<
  typeof findManyGroupMatchingsProcedure
>
const findManyGroupMatchingsProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationGroupMatchingSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canViewCommitteeApplicationInterviewSchedule(principal))))
  .query(async ({ ctx: context, input }) => {
    const schedule = await context.committeeApplicationService.getInterviewSchedule(
      context.prisma,
      input.applicationPeriodId
    )

    return schedule.groups
  })

const confirmInterviewsProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canConfirmCommitteeApplicationInterviews(principal))))
  .mutation(async ({ ctx: context, input, path }) => {
    const proposal = await context.committeeApplicationService.prepareInterviewPublication(
      context.prisma,
      input.applicationPeriodId
    )
    const transaction = createAuditedDatabaseTransaction({
      prisma: context.prisma,
      principal: context.principal,
      procedure: path,
    })

    return transaction(async ({ handle, setAuditTransactionName }) => {
      const applicationPeriod = await context.committeeApplicationService.confirmInterviews(
        handle,
        input.applicationPeriodId,
        proposal
      )

      setAuditTransactionName(
        `Publish CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
      )

      return applicationPeriod
    })
  })

const revertInterviewPublicationAndMatchingProcedure = procedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canRevertCommitteeApplicationInterviewPublication(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const applicationPeriod = await context.committeeApplicationService.revertInterviewPublicationAndMatching(
      context.handle,
      input.applicationPeriodId
    )

    context.setAuditTransactionName(
      `Revert CommitteeApplicationInterviewPublicationAndMatching(ApplicationPeriodID=${input.applicationPeriodId})`
    )

    return applicationPeriod
  })

export const committeeApplicationRouter = t.router({
  createPeriod: createPeriodProcedure,
  deletePeriod: deletePeriodProcedure,
  getPeriodById: getPeriodByIdProcedure,
  findManyPeriods: findManyPeriodsProcedure,
  findOpenPeriod: findOpenPeriodProcedure,
  updatePeriod: updatePeriodProcedure,

  findManyGroups: findManyGroupsProcedure,
  getApplicationGroupById: getApplicationGroupByIdProcedure,

  submitApplication: submitApplicationProcedure,
  getApplicationById: getApplicationByIdProcedure,
  findManyApplicationsByPeriodId: findManyApplicationsByPeriodIdProcedure,
  findMyApplication: findMyApplicationProcedure,
  getApplicantDetails: getApplicantDetailsProcedure,
  updateApplication: updateApplicationProcedure,
  setInterviewAttendance: setInterviewAttendanceProcedure,

  findManyInterviewBlocks: findManyInterviewBlocksProcedure,
  setInterviewBlocks: setInterviewBlocksProcedure,

  scheduleInterview: scheduleInterviewProcedure,
  cancelInterview: cancelInterviewProcedure,
  getInterviewById: getInterviewByIdProcedure,
  rescheduleInterview: rescheduleInterviewProcedure,

  generateInterviews: generateInterviewsProcedure,
  clearInterviews: clearInterviewsProcedure,
  getInterviewSchedule: getInterviewScheduleProcedure,
  findManyGroupMatchings: findManyGroupMatchingsProcedure,
  confirmInterviews: confirmInterviewsProcedure,
  revertInterviewPublicationAndMatching: revertInterviewPublicationAndMatchingProcedure,
})
