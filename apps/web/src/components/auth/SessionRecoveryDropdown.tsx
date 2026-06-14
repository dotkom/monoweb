"use client"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl, toAbsoluteUrl } from "@dotkomonline/utils"
import { IconAlertTriangleFilled, IconLogin2, IconLogout2 } from "@tabler/icons-react"
import type { FC } from "react"

type SessionRecoveryDropdownProps = {
  title: string
  description: string
  returnTo?: string
}

export const SessionRecoveryDropdown: FC<SessionRecoveryDropdownProps> = ({ title, description, returnTo }) => {
  const authorizeParams = returnTo !== undefined ? { returnTo } : undefined
  const logoutParams =
    returnTo !== undefined ? { returnTo: toAbsoluteUrl(window.location.origin, returnTo) } : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          aria-label="Åpne øktgjenopprettingsvalg"
          className="flex items-center justify-center size-10 rounded-full bg-red-200 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 transition-colors"
        >
          <IconAlertTriangleFilled className="size-5 text-red-600 dark:text-red-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="p-4 rounded-2xl w-76 bg-red-50 border border-red-100 dark:bg-stone-800 dark:border-stone-700/30 shadow-sm"
        sideOffset={24}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Title className="text-base font-semibold">{title}</Title>
            <Text className="text-sm text-gray-500 dark:text-stone-500">{description}</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button element="a" variant="default" href={createAuthorizeUrl(authorizeParams)}>
              <IconLogin2 className="size-5" />
              Logg inn på nytt
            </Button>
            <Button element="a" variant="outline" href={createLogoutUrl(logoutParams)}>
              <IconLogout2 className="size-5" />
              Logg ut
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
