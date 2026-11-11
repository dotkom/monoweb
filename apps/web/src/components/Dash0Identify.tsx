"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import { identify } from "@dash0/sdk-web"
import { useEffect } from "react"

const DASH0_ANONYMOUS_ID_STORAGE_KEY = "online_anonymous_id"

/**
 * Attaches a stable user id to Dash0 telemetry after auth is known.
 * Logged in users are identified by their Auth0 `sub`, email and name.
 * Anonymous users are identified by a persistent anonymous id.
 * See https://www.dash0.com/docs/dash0/monitoring/websites/getting-started-website-monitoring#tracking-users.
 */
export function Dash0Identify() {
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isAuthenticated = user?.sub != null && user.sub !== ""
    if (!isAuthenticated) {
      const anonymousId = getAnonymousId()
      identify(anonymousId)

      return
    }

    identify(user.sub, {
      email: user.email,
      name: user.name,
    })
  }, [isLoading, user])

  return null
}

function getAnonymousId() {
  let anonymousId = localStorage.getItem(DASH0_ANONYMOUS_ID_STORAGE_KEY)
  if (anonymousId === null || anonymousId === "") {
    anonymousId = crypto.randomUUID()
    localStorage.setItem(DASH0_ANONYMOUS_ID_STORAGE_KEY, anonymousId)
  }

  return anonymousId
}
