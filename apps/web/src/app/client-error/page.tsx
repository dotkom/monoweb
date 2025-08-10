"use client"

import { Button } from "@dotkomonline/ui"

export default function () {
  return (
    <Button
      onClick={() => {
        // biome-ignore lint/correctness/noConstantCondition: <explanation>
        if (2 + 2 !== 5) {
          throw new Error("Erm, what the sigma?")
        }
      }}
    >
      Click me
    </Button>
  )
}
