"use client"

import { env } from "@/env"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react"
import Turnstile, { type BoundTurnstileObject } from "react-turnstile"

// This file is used to provide a turnstile token to the event preview. It fetches in the background of the event list
// page and stores it in the context. When the event preview is opened, the token is used to verify the user.

type CachedToken = { value: string; userId: string }
type EventTurnstileContextValue = { token: string | null; takeToken: () => string | null }

const EventTurnstileContext = createContext<EventTurnstileContextValue | null>(null)

export const useEventTurnstile = () => useContext(EventTurnstileContext)

export function EventTurnstileProvider({
  children,
  backgroundEnabled = true,
}: PropsWithChildren<{ backgroundEnabled?: boolean }>) {
  const { dbUser } = useAuthenticatedUser()
  const userId = dbUser?.id ?? null
  const [cachedToken, setCachedToken] = useState<CachedToken | null>(null)
  const tokenRef = useRef<CachedToken | null>(null)
  const widgetRef = useRef<BoundTurnstileObject | null>(null)
  const [backgroundStopped, setBackgroundStopped] = useState(false)

  const storeToken = useCallback((token: CachedToken | null) => {
    tokenRef.current = token
    setCachedToken(token)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: tokens must be discarded when the signed-in user changes
  useEffect(() => {
    storeToken(null)
    setBackgroundStopped(false)
  }, [userId, storeToken])

  const clearToken = () => {
    storeToken(null)

    if (backgroundEnabled) {
      widgetRef.current?.reset()
    }
  }

  const takeToken = () => {
    const token = tokenRef.current

    if (token === null) {
      return null
    }

    const expired = widgetRef.current?.isExpired() ?? true

    // Consume synchronously so two registration attempts cannot use the same token.
    clearToken()

    if (token.userId !== userId || expired) {
      return null
    }

    return token.value
  }

  const stopBackground = () => {
    storeToken(null)
    setBackgroundStopped(true)
  }

  return (
    <EventTurnstileContext.Provider
      value={{ token: cachedToken?.userId === userId ? cachedToken.value : null, takeToken }}
    >
      {children}

      {userId !== null && (backgroundEnabled || cachedToken !== null) && backgroundStopped === false && (
        <div aria-hidden className="pointer-events-none fixed bottom-0 right-0">
          <Turnstile
            key={userId}
            sitekey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            appearance="interaction-only"
            retry="never"
            refreshExpired="manual"
            onLoad={(_, widget) => {
              widgetRef.current = widget
            }}
            onVerify={(value, widget) => {
              if (widget === widgetRef.current) {
                storeToken({ value, userId })
              }
            }}
            onExpire={(_, widget) => {
              if (widget === widgetRef.current) {
                clearToken()
              }
            }}
            onError={stopBackground}
            onTimeout={stopBackground}
            onBeforeInteractive={stopBackground}
          />
        </div>
      )}
    </EventTurnstileContext.Provider>
  )
}
