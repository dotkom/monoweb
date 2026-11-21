import { addWeeks } from "date-fns"
import type { Prisma } from ".."
import { eventId, getVolleyballEventEnd } from "./event"

export const fixtureFeedbackFormId = {
  volleyball: "f1a2b3c4-d5e6-4789-a012-3456789abcde",
} as const

export const fixtureFeedbackQuestionId = {
  rating: "a2b3c4d5-e6f7-4890-a123-456789abcdef",
  comment: "b3c4d5e6-f7a8-4901-b234-56789abcdef0",
  grade: "c4d5e6f7-a8b9-4012-c345-6789abcdef01",
} as const

export const fixtureFeedbackGradeOptions = [
  { id: "d5e6f7a8-b9c0-4123-d456-789abcdef012", name: "1. Klasse" },
  { id: "e6f7a8b9-c0d1-4234-e567-89abcdef0123", name: "2. Klasse" },
  { id: "f7a8b9c0-d1e2-4345-f678-9abcdef01234", name: "3. Klasse" },
  { id: "a8b9c0d1-e2f3-4456-a789-abcdef012345", name: "4. Klasse" },
  { id: "b9c0d1e2-f3a4-4567-b890-bcdef0123456", name: "5. Klasse" },
] satisfies Prisma.FeedbackQuestionOptionCreateWithoutQuestionInput[]

export const getFeedbackFormFixture = () =>
  ({
    id: fixtureFeedbackFormId.volleyball,
    answerDeadline: addWeeks(getVolleyballEventEnd(), 1),
    eventId: eventId("volleyball"),
    questions: {
      create: [
        {
          id: fixtureFeedbackQuestionId.rating,
          label: "Hva synes du om arrangementet?",
          type: "RATING",
          required: true,
          order: 0,
          showInPublicResults: true,
        },
        {
          id: fixtureFeedbackQuestionId.comment,
          label: "Hva var positivt med kveldens arrangement, og er det noe du skulle ønske ble gjort annerledes?",
          type: "LONGTEXT",
          required: true,
          order: 1,
          showInPublicResults: true,
        },
        {
          id: fixtureFeedbackQuestionId.grade,
          label: "Hvilket trinn går du i?",
          type: "SELECT",
          required: false,
          order: 2,
          showInPublicResults: true,
          options: {
            create: fixtureFeedbackGradeOptions,
          },
        },
      ],
    },
  }) satisfies Prisma.FeedbackFormUncheckedCreateInput
