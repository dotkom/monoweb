import { Alert } from "@dotkomonline/ui"
import type { PropsWithChildren } from "react"

export function ErrorMessage({ children }: PropsWithChildren) {
  return (
    <Alert status="danger" title="Feil ved henting av ressurs">
      {children}
    </Alert>
  )
}
