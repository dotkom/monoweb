import type { SelectionsFormValues } from "./SelectionsForm"

export const templates: Record<string, SelectionsFormValues> = {
  "Pizza / sushi": {
    selection: "Hvilken mat vil du ha?",
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
