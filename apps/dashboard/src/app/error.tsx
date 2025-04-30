"use client"

import { Button } from "@mantine/core"
import { useEffect } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Noe gikk galt!</h2>
      <Button onClick={() => reset()}>Prøv igjen</Button>
    </div>
  )
}
