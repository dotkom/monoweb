"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl, toAbsoluteUrl } from "@dotkomonline/utils"
import { IconLogin2 } from "@tabler/icons-react"
import type { FC } from "react"

type SessionRecoveryNoticeProps = {
  title: string
  description: string
  returnTo?: string
}

export const SessionRecoveryNotice: FC<SessionRecoveryNoticeProps> = ({ title, description, returnTo }) => {
  const authorizeParams = returnTo !== undefined ? { returnTo } : undefined
  const logoutParams =
    returnTo !== undefined ? { returnTo: toAbsoluteUrl(window.location.origin, returnTo) } : undefined

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
      <div className="flex flex-col gap-1">
        <Title className="text-base font-semibold">{title}</Title>
        <Text className="text-sm text-gray-700 dark:text-stone-300">{description}</Text>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button element="a" color="brand" href={createAuthorizeUrl(authorizeParams)} size="lg">
          Logg inn på nytt
          <IconLogin2 className="size-5" />
        </Button>
        <Button element="a" variant="outline" href={createLogoutUrl(logoutParams)} size="lg">
          Logg ut
        </Button>
      </div>
    </div>
  )
}
