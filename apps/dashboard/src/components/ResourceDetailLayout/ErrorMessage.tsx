import { Alert } from "@dotkomonline/ui"
import type { PropsWithChildren } from "react"

export function ErrorMessage({
  children,
  title = "Feil ved henting av ressurs",
}: PropsWithChildren<{ title?: string }>) {
  return (
    <Alert status="danger" title={title}>
      {children}
    </Alert>
  )
}
