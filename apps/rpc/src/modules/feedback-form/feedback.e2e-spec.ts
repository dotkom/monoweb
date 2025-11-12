import { randomUUID } from "node:crypto"
import {
  type EventWrite,
  type FeedbackFormWrite,
  type FeedbackQuestionOptionWrite,
  type FeedbackQuestionWrite,
  FeedbackRejectionCause,
} from "@dotkomonline/types"
import type { AttendanceId, EventId, UserId } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { faker } from "@faker-js/faker"
import { addDays } from "date-fns"
import invariant from "tiny-invariant"
import { describe, expect, it } from "vitest"
import { vi } from "vitest"
import { auth0Client, core, dbClient } from "../../../vitest-integration.setup"
import {
  getMockAttendance,
  getMockAttendancePool,
  getMockAuth0UserResponse,
  getMockMembership,
} from "../event/attendance.e2e-spec"
import { getMockEvent } from "../event/event.e2e-spec"

function getMockFeedbackForm(input: Partial<FeedbackFormWrite> = {}): FeedbackFormWrite {
  return {
    eventId: faker.string.uuid(),
    answerDeadline: faker.date.future(),
    ...input,
  }
}

function getMockQuestion(input: Partial<FeedbackQuestionWrite> = {}): FeedbackQuestionWrite {
  return {
    label: faker.string.uuid(),
    type: "TEXT",
    required: true,
    order: 1,
    showInPublicResults: false,
    ...input,
    options: input.options ?? [],
  }
}

function getMockQuestionOption(input: Partial<FeedbackQuestionOptionWrite> = {}): FeedbackQuestionOptionWrite {
  return {
    name: faker.string.uuid(),
    ...input,
  }
}

async function createMockUser() {
  const subject = randomUUID()
  auth0Client.users.get.mockResolvedValue(getMockAuth0UserResponse(subject))
  const userWithoutMembership = await core.userService.register(dbClient, subject)
  return await core.userService.createMembership(dbClient, userWithoutMembership.id, getMockMembership())
}

async function createMockAttendance(eventId: EventId) {
  const attendance = await core.attendanceService.createAttendance(dbClient, getMockAttendance())
  await core.eventService.updateEventAttendance(dbClient, eventId, attendance.id)
  await core.attendanceService.createAttendancePool(
    dbClient,
    attendance.id,
    getMockAttendancePool({
      yearCriteria: [1],
    })
  )

  return attendance
}

async function registerMockUserToAttendance(attendanceId: AttendanceId, userId: UserId) {
  const result = await core.attendanceService.getRegistrationAvailability(dbClient, attendanceId, userId, {
    immediateReservation: true,
    immediatePayment: false,
    ignoreRegistrationWindow: false,
    overriddenAttendancePoolId: null,
    ignoreRegisteredToParent: false,
  })
  invariant(result.success)
  return await core.attendanceService.registerAttendee(dbClient, result)
}

async function createMockEventWithAttendee(input: Partial<EventWrite> = {}) {
  const event = await core.eventService.createEvent(dbClient, getMockEvent(input))
  const user = await createMockUser()
  const attendance = await createMockAttendance(event.id)
  const attendee = await registerMockUserToAttendance(attendance.id, user.id)

  return { event, attendee, user }
}

describe("feedback integration tests", () => {
  it("should create a new feedback form", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent())

    const mockFeedbackForm = getMockFeedbackForm({ eventId: event.id })
    const mockQuestions = Array.from({ length: 3 }, () =>
      getMockQuestion({
        options: [getMockQuestionOption()],
      })
    )
    const feedbackForm = await core.feedbackFormService.create(dbClient, mockFeedbackForm, mockQuestions)

    expect(feedbackForm.eventId).toBe(event.id)
    expect(feedbackForm.answerDeadline.getTime()).toBe(mockFeedbackForm.answerDeadline.getTime())
    expect(feedbackForm.questions).toHaveLength(mockQuestions.length)

    expect(feedbackForm.questions).toEqual(
      expect.arrayContaining(
        mockQuestions.map((question) =>
          expect.objectContaining({
            ...question,
            options: expect.arrayContaining(question.options.map((option) => expect.objectContaining(option))),
          })
        )
      )
    )
  })

  it("should copy feedback form with the same questions", async () => {
    const event1 = await core.eventService.createEvent(dbClient, getMockEvent())
    const event2 = await core.eventService.createEvent(dbClient, getMockEvent())

    const mockFeedbackForm = getMockFeedbackForm({ eventId: event1.id })
    const mockQuestions = Array.from({ length: 2 }, () =>
      getMockQuestion({
        type: "SELECT",
        options: [getMockQuestionOption(), getMockQuestionOption()],
      })
    )

    const originalForm = await core.feedbackFormService.create(dbClient, mockFeedbackForm, mockQuestions)
    const copiedForm = await core.feedbackFormService.createCopyFromEvent(dbClient, event2.id, event1.id)

    expect(copiedForm.eventId).toBe(event2.id)
    expect(copiedForm.questions).toHaveLength(originalForm.questions.length)

    expect(copiedForm.questions).toEqual(
      expect.arrayContaining(
        originalForm.questions.map((question) => {
          const { createdAt, updatedAt, id, feedbackFormId, options, ...questionRest } = question

          return expect.objectContaining({
            ...questionRest,
            options: expect.arrayContaining(
              question.options.map((option) => {
                const { id, questionId, ...optionRest } = option

                return expect.objectContaining(optionRest)
              })
            ),
          })
        })
      )
    )
  })

  it("creating a feedback form should schedule verify answered task", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent())

    const mockFeedbackForm = getMockFeedbackForm({ eventId: event.id })
    const feedbackForm = await core.feedbackFormService.create(dbClient, mockFeedbackForm, [])

    const task = await core.taskSchedulingService.findVerifyFeedbackAnsweredTask(dbClient, feedbackForm.id)
    invariant(task, "Scheduled task should exist")
    expect(task.scheduledAt.getTime()).toBe(feedbackForm.answerDeadline.getTime())
  })

  it("updating feedback form should reschedule verify answered task", async () => {
    const cancelSpy = vi.spyOn(core.taskSchedulingService, "cancel")

    const event = await core.eventService.createEvent(dbClient, getMockEvent())

    const mockFeedbackForm = getMockFeedbackForm({ eventId: event.id })
    const feedbackForm = await core.feedbackFormService.create(dbClient, mockFeedbackForm, [])

    const task = await core.taskSchedulingService.findVerifyFeedbackAnsweredTask(dbClient, feedbackForm.id)
    invariant(task, "Scheduled task should exist")
    expect(task.scheduledAt.getTime()).toBe(feedbackForm.answerDeadline.getTime())

    const newAnswerDeadline = addDays(feedbackForm.answerDeadline, 5)
    await core.feedbackFormService.update(
      dbClient,
      feedbackForm.id,
      {
        eventId: event.id,
        answerDeadline: newAnswerDeadline,
      },
      feedbackForm.questions
    )

    expect(cancelSpy).toHaveBeenCalledWith(dbClient, task.id)

    const updatedTask = await core.taskSchedulingService.findVerifyFeedbackAnsweredTask(dbClient, feedbackForm.id)
    invariant(updatedTask, "Updated scheduled task should exist")

    expect(updatedTask.scheduledAt.getTime()).toBe(newAnswerDeadline.getTime())
  })

  it("user should not be able to answer feedback form before event has ended", async () => {
    const { event, user } = await createMockEventWithAttendee({ start: faker.date.past(), end: faker.date.future() })

    const feedbackForm = await core.feedbackFormService.create(dbClient, getMockFeedbackForm({ eventId: event.id }), [])

    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)
    invariant(!result.success)
    expect(result.cause).toBe(FeedbackRejectionCause.TOO_EARLY)
  })

  it("user should not be able to answer feedback form after deadline", async () => {
    const { event, user } = await createMockEventWithAttendee({
      start: faker.date.past(),
      end: faker.date.past(),
    })

    const answerDeadline = faker.date.past()

    const feedbackForm = await core.feedbackFormService.create(
      dbClient,
      getMockFeedbackForm({ eventId: event.id, answerDeadline }),
      []
    )

    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)
    invariant(!result.success)
    expect(result.cause).toBe(FeedbackRejectionCause.TOO_LATE)
  })

  it("user should not be able to answer feedback form for event they are not an attendee of", async () => {
    const event = await core.eventService.createEvent(dbClient, getMockEvent({ end: faker.date.past() }))
    const user = await createMockUser()
    await createMockAttendance(event.id)

    const feedbackForm = await core.feedbackFormService.create(dbClient, getMockFeedbackForm({ eventId: event.id }), [])

    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)

    invariant(!result.success)
    expect(result.cause).toBe(FeedbackRejectionCause.DID_NOT_ATTEND)
  })

  it("user should not be able to answer feedback form for event they did not attend", async () => {
    const { event, user } = await createMockEventWithAttendee({
      start: faker.date.past(),
      end: faker.date.past(),
    })

    const feedbackForm = await core.feedbackFormService.create(dbClient, getMockFeedbackForm({ eventId: event.id }), [])
    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)

    invariant(!result.success)
    expect(result.cause).toBe(FeedbackRejectionCause.DID_NOT_ATTEND)
  })

  it("user should be able to answer feedback form after event has ended before answer deadline", async () => {
    const { event, attendee, user } = await createMockEventWithAttendee({
      start: faker.date.past(),
      end: faker.date.past(),
    })

    await core.attendanceService.registerAttendance(dbClient, attendee.id, getCurrentUTC())

    const feedbackForm = await core.feedbackFormService.create(dbClient, getMockFeedbackForm({ eventId: event.id }), [])

    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)
    expect(result.success).toBe(true)
  })

  it("user should not be able to answer feedback form multiple times", async () => {
    const { event, attendee, user } = await createMockEventWithAttendee({
      start: faker.date.past(),
      end: faker.date.past(),
    })

    await core.attendanceService.registerAttendance(dbClient, attendee.id, getCurrentUTC())

    const feedbackForm = await core.feedbackFormService.create(dbClient, getMockFeedbackForm({ eventId: event.id }), [])
    const result = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)

    expect(result.success).toBe(true)

    await core.feedbackFormAnswerService.create(
      dbClient,
      {
        feedbackFormId: feedbackForm.id,
        attendeeId: attendee.id,
      },
      []
    )

    const secondResult = await core.feedbackFormService.getFeedbackEligibility(dbClient, feedbackForm.id, user.id)
    invariant(!secondResult.success)
    expect(secondResult.cause).toBe(FeedbackRejectionCause.ALREADY_ANSWERED)
  })
})
