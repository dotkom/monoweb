import type { SelectionsFormValues } from "./components/selection-form"

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
