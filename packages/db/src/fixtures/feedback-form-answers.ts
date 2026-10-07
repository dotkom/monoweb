import { addWeeks } from "date-fns"
import { Prisma, type Prisma as PrismaTypes, type Event } from ".."

export const FEEDBACK_ANSWERS_FORM_ID = "f1a2b3c4-d5e6-4789-a012-3456789abcde"

const FEEDBACK_ANSWERS_RATING_QUESTION_ID = "a2b3c4d5-e6f7-4890-a123-456789abcdef"
const FEEDBACK_ANSWERS_LONGTEXT_QUESTION_ID = "b3c4d5e6-f7a8-4901-b234-56789abcdef0"
const FEEDBACK_ANSWERS_SELECT_QUESTION_ID = "c4d5e6f7-a8b9-4012-c345-6789abcdef01"

export const FEEDBACK_ANSWERS_SELECT_OPTION_IDS = [
  "d5e6f7a8-b9c0-4123-d456-789abcdef012",
  "e6f7a8b9-c0d1-4234-e567-89abcdef0123",
  "f7a8b9c0-d1e2-4345-f678-9abcdef01234",
  "a8b9c0d1-e2f3-4456-a789-abcdef012345",
  "b9c0d1e2-f3a4-4567-b890-bcdef0123456",
] as const

export const getFeedbackAnswerEventFormFixture = (event: Event): PrismaTypes.FeedbackFormUncheckedCreateInput => ({
  id: FEEDBACK_ANSWERS_FORM_ID,
  eventId: event.id,
  answerDeadline: addWeeks(event.end, 1),
  questions: {
    create: [
      {
        id: FEEDBACK_ANSWERS_RATING_QUESTION_ID,
        label: "Hva synes du om arrangementet?",
        type: "RATING",
        required: true,
        order: 0,
        showInPublicResults: true,
      },
      {
        id: FEEDBACK_ANSWERS_LONGTEXT_QUESTION_ID,
        label: "Hva var positivt med kveldens arrangement, og er det noe du skulle ønske ble gjort annerledes?",
        type: "LONGTEXT",
        required: true,
        order: 1,
        showInPublicResults: true,
      },
      {
        id: FEEDBACK_ANSWERS_SELECT_QUESTION_ID,
        label: "Hvilket trinn går du i?",
        type: "SELECT",
        required: false,
        order: 2,
        showInPublicResults: true,
        options: {
          create: [
            { id: FEEDBACK_ANSWERS_SELECT_OPTION_IDS[0], name: "1. Klasse" },
            { id: FEEDBACK_ANSWERS_SELECT_OPTION_IDS[1], name: "2. Klasse" },
            { id: FEEDBACK_ANSWERS_SELECT_OPTION_IDS[2], name: "3. Klasse" },
            { id: FEEDBACK_ANSWERS_SELECT_OPTION_IDS[3], name: "4. Klasse" },
            { id: FEEDBACK_ANSWERS_SELECT_OPTION_IDS[4], name: "5. Klasse" },
          ],
        },
      },
    ],
  },
})

export const getFeedbackFormAnswerFixtures = (
  attendeeIds: readonly string[]
): PrismaTypes.FeedbackFormAnswerUncheckedCreateInput[] =>
  attendeeIds.map((attendeeId, index) => ({
    feedbackFormId: FEEDBACK_ANSWERS_FORM_ID,
    attendeeId,
    answers: {
      create: [
        {
          questionId: FEEDBACK_ANSWERS_RATING_QUESTION_ID,
          value: 3 + (index % 3),
        },
        {
          questionId: FEEDBACK_ANSWERS_LONGTEXT_QUESTION_ID,
          value: `Kjempefin kveld! Veldig god stemning og enkelt å møte nye folk (svar ${index + 1}).`,
        },
        {
          questionId: FEEDBACK_ANSWERS_SELECT_QUESTION_ID,
          value: Prisma.JsonNull,
          selectedOptions: {
            create: [
              {
                feedbackQuestionOptionId:
                  FEEDBACK_ANSWERS_SELECT_OPTION_IDS[index % FEEDBACK_ANSWERS_SELECT_OPTION_IDS.length],
              },
            ],
          },
        },
      ],
    },
  }))
