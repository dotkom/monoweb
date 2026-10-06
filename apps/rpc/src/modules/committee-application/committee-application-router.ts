import { PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isCommitteeMember, isGroupMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
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
const administratorAuthenticationProcedure = procedure
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
const administratorProcedure = administratorAuthenticationProcedure.use(withDatabaseTransaction())
const administratorMutationProcedure = administratorProcedure.use(withAuditLogEntry())
const committeeMemberProcedure = procedure.use(withAuthentication()).use(withAuthorization(isCommitteeMember()))

export type FindOpenCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof findOpenPeriodProcedure>
const findOpenPeriodProcedure = procedure
  .output(CommitteeApplicationOpenPeriodSchema.nullable())
  .use(withDatabaseTransaction())
  .query(({ ctx: context }) => context.committeeApplicationService.findOpenPeriod(context.handle))

const submitApplicationProcedure = procedure
  .input(CommitteeApplicationSubmitSchema)
  .output(CommitteeApplicationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(({ ctx: context, input }) =>
    context.committeeApplicationService.submitApplication(context.handle, context.principal.subject, input)
  )
const updateApplicationProcedure = procedure
  .input(
    z.object({ applicationId: CommitteeApplicationSchema.shape.id, application: CommitteeApplicationUpdateSchema })
  )
  .output(CommitteeApplicationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(({ ctx: context, input }) =>
    context.committeeApplicationService.updateApplication(
      context.handle,
      context.principal.subject,
      input.applicationId,
      input.application
    )
  )
const findMyApplicationProcedure = procedure
  .input(z.object({ applicationPeriodId: CommitteeApplicationPeriodSchema.shape.id.optional() }).optional())
  .output(CommitteeApplicationApplicantViewSchema.nullable())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.findApplicantView(
      context.handle,
      context.principal.subject,
      input?.applicationPeriodId
    )
  )

export type CreateCommitteeApplicationPeriodInput = inferProcedureInput<typeof createPeriodProcedure>
export type CreateCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof createPeriodProcedure>
const createPeriodProcedure = administratorMutationProcedure
  .input(CommitteeApplicationPeriodCreateSchema)
  .output(CommitteeApplicationPeriodSchema)
  .mutation(async ({ ctx: context, input }) => {
    const applicationPeriod = await context.committeeApplicationService.createPeriod(context.handle, input)
    context.setAuditTransactionName(
      `Create CommitteeApplicationPeriod(ID=${applicationPeriod.id},Name=${applicationPeriod.name})`
    )
    return applicationPeriod
  })
export type UpdateCommitteeApplicationPeriodInput = inferProcedureInput<typeof updatePeriodProcedure>
export type UpdateCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof updatePeriodProcedure>
const updatePeriodProcedure = administratorMutationProcedure
  .input(CommitteeApplicationPeriodUpdateSchema.extend(applicationPeriodInputSchema.shape))
  .output(CommitteeApplicationPeriodSchema)
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
export type DeleteCommitteeApplicationPeriodInput = inferProcedureInput<typeof deletePeriodProcedure>
const deletePeriodProcedure = administratorMutationProcedure
  .input(applicationPeriodInputSchema)
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.deletePeriod(context.handle, input.applicationPeriodId)
    context.setAuditTransactionName(`Delete CommitteeApplicationPeriod(ID=${input.applicationPeriodId})`)
  })
export type GetCommitteeApplicationPeriodByIdInput = inferProcedureInput<typeof getPeriodByIdProcedure>
export type GetCommitteeApplicationPeriodByIdOutput = inferProcedureOutput<typeof getPeriodByIdProcedure>
const getPeriodByIdProcedure = administratorProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.getPeriodById(context.handle, input.applicationPeriodId)
  )
export type FindManyCommitteeApplicationPeriodsInput = inferProcedureInput<typeof findManyPeriodsProcedure>
export type FindManyCommitteeApplicationPeriodsOutput = inferProcedureOutput<typeof findManyPeriodsProcedure>
const findManyPeriodsProcedure = administratorProcedure
  .input(PaginateInputSchema)
  .output(CommitteeApplicationPeriodSchema.array())
  .query(({ ctx: context, input }) => context.committeeApplicationService.findManyPeriods(context.handle, input))

export type FindManyCommitteeApplicationGroupsInput = inferProcedureInput<typeof findManyGroupsProcedure>
export type FindManyCommitteeApplicationGroupsOutput = inferProcedureOutput<typeof findManyGroupsProcedure>
const findManyGroupsProcedure = administratorProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationGroupStatusSchema.array())
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.findManyGroupsByPeriodId(context.handle, input.applicationPeriodId)
  )
const getApplicationGroupByIdProcedure = administratorProcedure
  .input(applicationGroupInputSchema)
  .output(CommitteeApplicationGroupSchema)
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.getApplicationGroupById(context.handle, input.applicationGroupId)
  )
const getApplicationByIdProcedure = administratorProcedure
  .input(applicantInputSchema)
  .output(CommitteeApplicationSchema)
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.getApplicationById(context.handle, input.applicationId)
  )
const findManyApplicationsByPeriodIdProcedure = administratorProcedure
  .input(applicationPeriodInputSchema.extend({ page: PaginateInputSchema }))
  .output(CommitteeApplicationSchema.array())
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.findManyApplicationsByPeriodId(
      context.handle,
      input.applicationPeriodId,
      input.page
    )
  )

export type GetCommitteeApplicationApplicantDetailsInput = inferProcedureInput<typeof getApplicantDetailsProcedure>
export type GetCommitteeApplicationApplicantDetailsOutput = inferProcedureOutput<typeof getApplicantDetailsProcedure>
const getApplicantDetailsProcedure = committeeMemberProcedure
  .input(applicantInputSchema)
  .output(CommitteeApplicationApplicantDetailsSchema)
  .use(withDatabaseTransaction())
  .query(async ({ ctx: context, input }) => {
    const applicantDetails = await context.committeeApplicationService.getApplicantDetailsById(
      context.handle,
      input.applicationId
    )
    await context.addAuthorizationGuard(
      or(
        isAdministrator(),
        ...applicantDetails.groupSelections.map((selection) => isGroupMember(() => selection.groupId))
      ),
      input
    )
    return applicantDetails
  })
const setInterviewAttendanceProcedure = committeeMemberProcedure
  .input(groupSelectionInputSchema.extend({ isAttending: z.boolean() }))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx: context, input }) => {
    const applicationGroup = await context.committeeApplicationService.getApplicationGroupById(
      context.handle,
      input.applicationGroupId
    )
    await context.addAuthorizationGuard(
      isGroupMember(() => applicationGroup.groupId),
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
const findManyInterviewBlocksProcedure = administratorProcedure
  .input(applicationGroupInputSchema)
  .output(CommitteeApplicationInterviewBlockSchema.array())
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.findManyInterviewBlocksByGroupId(context.handle, input.applicationGroupId)
  )
const setInterviewBlocksProcedure = administratorMutationProcedure
  .input(applicationGroupInputSchema.extend(CommitteeApplicationInterviewBlocksSetSchema.shape))
  .output(CommitteeApplicationInterviewBlockSchema.array())
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

const getInterviewScheduleProcedure = administratorProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationInterviewScheduleSchema)
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.getInterviewSchedule(context.handle, input.applicationPeriodId)
  )
export type FindManyCommitteeApplicationGroupSchedulesInput = inferProcedureInput<
  typeof findManyGroupMatchingsProcedure
>
export type FindManyCommitteeApplicationGroupSchedulesOutput = inferProcedureOutput<
  typeof findManyGroupMatchingsProcedure
>
const findManyGroupMatchingsProcedure = administratorProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationGroupMatchingSchema.array())
  .query(
    async ({ ctx: context, input }) =>
      (await context.committeeApplicationService.getInterviewSchedule(context.handle, input.applicationPeriodId)).groups
  )
const generateInterviewsProcedure = administratorAuthenticationProcedure
  .use(withDatabaseTransaction("ReadCommitted", 120_000))
  .use(withAuditLogEntry())
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationInterviewScheduleSchema)
  .mutation(async ({ ctx: context, input }) => {
    const schedule = await context.committeeApplicationService.generateInterviews(
      context.handle,
      input.applicationPeriodId
    )
    context.setAuditTransactionName(
      `Generate CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
    )
    return schedule
  })
const clearInterviewsProcedure = administratorMutationProcedure
  .input(applicationPeriodInputSchema)
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.clearInterviews(context.handle, input.applicationPeriodId)
    context.setAuditTransactionName(
      `Clear CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
    )
  })
const confirmInterviewsProcedure = administratorMutationProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
  .mutation(async ({ ctx: context, input }) => {
    const applicationPeriod = await context.committeeApplicationService.confirmInterviews(
      context.handle,
      input.applicationPeriodId
    )
    context.setAuditTransactionName(
      `Publish CommitteeApplicationInterviews(ApplicationPeriodID=${input.applicationPeriodId})`
    )
    return applicationPeriod
  })

const revertInterviewPublicationAndMatchingProcedure = administratorMutationProcedure
  .input(applicationPeriodInputSchema)
  .output(CommitteeApplicationPeriodSchema)
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

const scheduleInterviewProcedure = administratorMutationProcedure
  .input(
    z.object({
      groupSelectionId: CommitteeApplicationGroupSelectionSchema.shape.id,
      interview: CommitteeApplicationInterviewPlacementSchema,
    })
  )
  .output(CommitteeApplicationInterviewSchema)
  .mutation(async ({ ctx: context, input }) => {
    const interview = await context.committeeApplicationService.scheduleInterview(
      context.handle,
      input.groupSelectionId,
      input.interview
    )
    context.setAuditTransactionName(`Schedule CommitteeApplicationInterview(ID=${interview.id})`)
    return interview
  })
const rescheduleInterviewProcedure = administratorMutationProcedure
  .input(interviewInputSchema.extend({ interview: CommitteeApplicationInterviewPlacementSchema }))
  .output(CommitteeApplicationInterviewSchema)
  .mutation(async ({ ctx: context, input }) => {
    const interview = await context.committeeApplicationService.rescheduleInterview(
      context.handle,
      input.interviewId,
      input.interview
    )
    context.setAuditTransactionName(`Reschedule CommitteeApplicationInterview(ID=${interview.id})`)
    return interview
  })
const cancelInterviewProcedure = administratorMutationProcedure
  .input(interviewInputSchema)
  .mutation(async ({ ctx: context, input }) => {
    await context.committeeApplicationService.cancelInterview(context.handle, input.interviewId)
    context.setAuditTransactionName(`Cancel CommitteeApplicationInterview(ID=${input.interviewId})`)
  })
const getInterviewByIdProcedure = administratorProcedure
  .input(interviewInputSchema)
  .output(CommitteeApplicationInterviewSchema)
  .query(({ ctx: context, input }) =>
    context.committeeApplicationService.getInterviewById(context.handle, input.interviewId)
  )

export const committeeApplicationRouter = t.router({
  createPeriod: createPeriodProcedure,
  updatePeriod: updatePeriodProcedure,
  deletePeriod: deletePeriodProcedure,
  getPeriodById: getPeriodByIdProcedure,
  findManyPeriods: findManyPeriodsProcedure,
  findOpenPeriod: findOpenPeriodProcedure,
  findManyGroups: findManyGroupsProcedure,
  getApplicationGroupById: getApplicationGroupByIdProcedure,
  submitApplication: submitApplicationProcedure,
  updateApplication: updateApplicationProcedure,
  findMyApplication: findMyApplicationProcedure,
  getApplicationById: getApplicationByIdProcedure,
  findManyApplicationsByPeriodId: findManyApplicationsByPeriodIdProcedure,
  getApplicantDetails: getApplicantDetailsProcedure,
  setInterviewAttendance: setInterviewAttendanceProcedure,
  setInterviewBlocks: setInterviewBlocksProcedure,
  findManyInterviewBlocks: findManyInterviewBlocksProcedure,
  generateInterviews: generateInterviewsProcedure,
  clearInterviews: clearInterviewsProcedure,
  confirmInterviews: confirmInterviewsProcedure,
  revertInterviewPublicationAndMatching: revertInterviewPublicationAndMatchingProcedure,
  getInterviewSchedule: getInterviewScheduleProcedure,
  findManyGroupMatchings: findManyGroupMatchingsProcedure,
  scheduleInterview: scheduleInterviewProcedure,
  rescheduleInterview: rescheduleInterviewProcedure,
  cancelInterview: cancelInterviewProcedure,
  getInterviewById: getInterviewByIdProcedure,
})
