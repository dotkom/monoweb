"use client"

import { Button } from "@dotkomonline/ui"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { confirmIdentityLinkAction } from "./actions"

export function ConfirmIdentityLinkButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await confirmIdentityLinkAction()

        router.replace("/innstillinger/bruker?link_status=ok")
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : null
        const query = errorMessage ? `&error=${encodeURIComponent(errorMessage)}` : ""

        router.replace(`/innstillinger/bruker?link_status=failed${query}`)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button color="brand" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Kobler brukere..." : "Bekreft og koble brukere"}
        </Button>
        <Button element="a" href="/innstillinger/bruker" variant="outline" disabled={isPending}>
          Avbryt
        </Button>
      </div>
    </div>
  )
}
