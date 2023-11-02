import { type ExtrasFormValues } from "./ExtrasForm"

export const templates: Record<string, ExtrasFormValues> = {
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
