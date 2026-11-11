"use client"

import { reportError } from "@dash0/sdk-web"
import NextError from "next/error"
import { useEffect } from "react"

export type GlobalErrorProps = {
  error: Error & { digest?: string }
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <html lang="no">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
