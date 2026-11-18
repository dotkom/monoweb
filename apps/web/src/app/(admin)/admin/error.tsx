"use client"

import { reportError } from "@dash0/sdk-web"
import { Button } from "@dotkomonline/ui"
import { useEffect } from "react"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error)
  }, [error])
  console.error(error)
  return (
    <div>
      <h2>Noe gikk galt!</h2>
      <Button onClick={() => reset()}>Prøv igjen</Button>
    </div>
  )
}
