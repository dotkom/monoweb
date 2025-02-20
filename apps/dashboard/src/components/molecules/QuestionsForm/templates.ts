import type { QuestionsFormValues } from "./QuestionsForm"

export const templates: Record<string, QuestionsFormValues> = {
  "Pizza / sushi": {
    question: "Hvilken mat vil du ha?",
    alternatives: [
      {
        value: "Pizza",
      },
      {
        value: "Sushi",
      },
    ],
  },
}
