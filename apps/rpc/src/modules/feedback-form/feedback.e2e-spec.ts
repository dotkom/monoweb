import type { EventWrite, FeedbackFormWrite, FeedbackQuestionWrite } from "@dotkomonline/types"
import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { core, dbClient } from "../../../vitest-integration.setup"

function getMockEvent(input: Partial<EventWrite> = {}): EventWrite {
  return {
    status: "PUBLIC",
    type: "SOCIAL",
    title: faker.lorem.sentence(1),
    start: faker.date.future(),
    end: faker.date.future(),
    description: faker.lorem.paragraphs(3),
    imageUrl: faker.image.url(),
    locationTitle: faker.location.city(),
    locationAddress: faker.location.streetAddress(),
    locationLink: null,
    markForMissedAttendance: true,
    ...input,
  }
}

function getMockFeedbackForm(input: Partial<FeedbackFormWrite> = {}): FeedbackFormWrite {
  return {
    eventId: faker.string.uuid(),
    isActive: true,
    answerDeadline: faker.date.future(),
    ...input,
  }
}

function getMockQuestion(input: Partial<FeedbackQuestionWrite> = {}): FeedbackQuestionWrite {
  return {
    label: faker.lorem.sentence(),
    type: "TEXT",
    required: true,
    order: 1,
    options: [],
    showInPublicResults: false,
    ...input,
  }
}

describe("feedback integration tests", () => {
  it("should create a new feedback form", async () => {
    const mockEvent = getMockEvent()
    const event = await core.eventService.createEvent(dbClient, mockEvent)

    const mockFeedbackForm = getMockFeedbackForm({ eventId: event.id })
    const feedbackForm = await core.feedbackFormService.create(dbClient, mockFeedbackForm, [])

    expect(feedbackForm.eventId).toBe(event.id)
    expect(feedbackForm.isActive).toBe(mockFeedbackForm.isActive)
    expect(feedbackForm.answerDeadline).toBe(mockFeedbackForm.answerDeadline)
    expect(feedbackForm.questions).toHaveLength(0)
  })
})
