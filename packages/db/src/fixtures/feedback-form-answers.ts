import { Prisma } from ".."
import { fixtureVolleyballAttendeeId } from "./attendee"
import { fixtureFeedbackFormId, fixtureFeedbackGradeOptions, fixtureFeedbackQuestionId } from "./feedback-form"

export const getFeedbackFormAnswerFixtures = (): Prisma.FeedbackFormAnswerUncheckedCreateInput[] =>
  Object.values(fixtureVolleyballAttendeeId).map((attendeeId, index) => {
    const gradeOption = fixtureFeedbackGradeOptions[index % fixtureFeedbackGradeOptions.length]

    return {
      feedbackFormId: fixtureFeedbackFormId.volleyball,
      attendeeId,
      answers: {
        create: [
          {
            questionId: fixtureFeedbackQuestionId.rating,
            value: 3 + (index % 3),
          },
          {
            questionId: fixtureFeedbackQuestionId.comment,
            value: `Kjempefin kveld! Veldig god stemning og enkelt å møte nye folk (svar ${index + 1}).`,
          },
          {
            questionId: fixtureFeedbackQuestionId.grade,
            value: Prisma.JsonNull,
            selectedOptions: {
              create: [
                {
                  feedbackQuestionOptionId: gradeOption.id,
                },
              ],
            },
          },
        ],
      },
    }
  })
