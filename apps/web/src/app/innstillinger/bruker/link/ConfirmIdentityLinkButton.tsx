"use client"

import { Button } from "@dotkomonline/ui"
import { createLogoutUrl } from "@dotkomonline/utils"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { confirmIdentityLinkAction } from "./actions"
import { IDENTITY_LINK_REQUIRES_LOGIN_KEY } from "@/components/notices/identity-link-success-notice"

export function ConfirmIdentityLinkButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onConfirm = () => {
    startTransition(async () => {
      sessionStorage.setItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY, "ok")

      try {
        const result = await confirmIdentityLinkAction()

        if (result.requiresReauthentication) {
          window.location.assign(createLogoutUrl({ returnTo: window.location.origin }))

          return
        }

        sessionStorage.removeItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY)
        router.replace("/innstillinger/bruker?link_status=ok")
      } catch (error: unknown) {
        sessionStorage.removeItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY)
        const errorMessage = error instanceof Error ? error.message : null
        const query = errorMessage ? `&error=${encodeURIComponent(errorMessage)}` : ""

        router.replace(`/innstillinger/bruker?link_status=failed${query}`)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button variant="default" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Kobler brukere..." : "Bekreft og koble brukere"}
        </Button>
        <Button element="a" href="/innstillinger/bruker" variant="outline" disabled={isPending}>
          Avbryt
        </Button>
      </div>
    </div>
  )
}
