"use client"

import { Button } from "@mantine/core"
import {getBrowserLogger} from "@dotkomonline/logger";

const logger = getBrowserLogger('monoweb-dashboard')

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  logger.error(error)
  return (
    <div>
      <h2>Noe gikk galt!</h2>
      <Button onClick={() => reset()}>Prøv igjen</Button>
    </div>
  )
}
