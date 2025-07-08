import {
  AttendeeSchema,
  EventSchema,
  FeedbackFormAnswerWriteSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  createForm: adminProcedure
    .input(FeedbackFormWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.create(handle, input))
    ),
  updateForm: adminProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        data: FeedbackFormWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.update(handle, input.id, input.data))
    ),
  deleteForm: adminProcedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.delete(handle, input))
    ),
  getFormById: protectedProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getById(handle, input))
    ),
  findFormByEventId: protectedProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.findByEventId(handle, input))
    ),
  createAnswer: protectedProcedure
    .input(FeedbackFormAnswerWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.create(handle, input))
    ),
  findAnswerByAttendee: adminProcedure
    .input(
      z.object({
        formId: FeedbackFormIdSchema,
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormAnswerService.findAnswerByAttendee(handle, input.formId, input.attendeeId)
      )
    ),
  getAllAnswers: adminProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getAllAnswers(handle, input))
    ),
})
