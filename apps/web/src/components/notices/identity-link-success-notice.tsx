"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck, IconLogin2 } from "@tabler/icons-react"
import { useLayoutEffect, useState, type FC } from "react"
import { clearIdentityLinkStatusAction } from "@/app/innstillinger/bruker/link/actions"

export const IDENTITY_LINK_REQUIRES_LOGIN_KEY = "monoweb-link-status"

export function useIdentityLinkRequiresLogin(): boolean {
  const [requiresLogin, setRequiresLogin] = useState(false)

  useLayoutEffect(() => {
    setRequiresLogin(sessionStorage.getItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY) === "ok")
  }, [])

  return requiresLogin
}

export const IdentityLinkSuccessNotice: FC<{ initialVisible?: boolean }> = ({ initialVisible = false }) => {
  const [isVisible, setIsVisible] = useState(initialVisible)

  useLayoutEffect(() => {
    const storedStatus = sessionStorage.getItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY)
    const shouldShow = initialVisible || storedStatus === "ok"

    if (!shouldShow) {
      return
    }

    sessionStorage.removeItem(IDENTITY_LINK_REQUIRES_LOGIN_KEY)
    void clearIdentityLinkStatusAction()
    setIsVisible(true)
  }, [initialVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 bg-green-100 dark:bg-green-900 p-4 rounded-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-row gap-3 items-center">
        <IconCheck size="1.25em" className="text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex flex-col">
          <Title size="sm" className="text-sm">
            Koblingen er vellykket
          </Title>
          <Text className="text-xs">Logg inn på nytt for å fortsette med den sammenslåtte brukeren.</Text>
        </div>
      </div>
      <Button
        variant="default"
        className="w-fit"
        onClick={() => {
          void clearIdentityLinkStatusAction().finally(() => {
            window.location.assign(createAuthorizeUrl({ returnTo: "/innstillinger/bruker" }))
          })
        }}
      >
        <IconLogin2 className="size-4" />
        <Text className="text-sm">Logg inn på nytt</Text>
      </Button>
    </div>
  )
}
