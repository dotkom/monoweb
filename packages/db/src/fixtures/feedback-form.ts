import { addWeeks } from "date-fns"
import type { Prisma } from ".."
import type { Event } from "../"

export const getFeedbackFormFixture = (event: Event): Prisma.FeedbackFormUncheckedCreateInput => ({
  answerDeadline: addWeeks(event.end, 1),
  eventId: event.id,
  questions: {
    create: [
      {
        label: "Hva synes du om arrangementet?",
        type: "RATING",
        required: true,
        order: 0,
        showInPublicResults: true,
      },
      {
        label: "Hva var positivt med kveldens arrangement, og er det noe du skulle ønske ble gjort annerledes?",
        type: "LONGTEXT",
        required: true,
        order: 1,
        showInPublicResults: true,
      },
      {
        label: "Hvilket trinn går du i?",
        type: "SELECT",
        required: false,
        order: 2,
        showInPublicResults: true,
        options: {
          create: [
            { name: "1. Klasse" },
            { name: "2. Klasse" },
            { name: "3. Klasse" },
            { name: "4. Klasse" },
            { name: "5. Klasse" },
          ],
        },
      },
    ],
  },
})
