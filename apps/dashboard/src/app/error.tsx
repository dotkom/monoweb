"use client"

import { Button } from "@mantine/core"
import * as Sentry from "@sentry/nextjs"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  Sentry.captureException(error)
  console.error(error)
  return (
    <div>
      <h2>Noe gikk galt!</h2>
      <Button onClick={() => reset()}>Prøv igjen</Button>
    </div>
  )
}
