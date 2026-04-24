"use client"

import { FeideIcon } from "@/components/icons/FeideIcon"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAbsoluteLinkIdentityAuthorizeUrl, createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck, IconLink, IconPassword, IconX } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { redirect, useSearchParams } from "next/navigation"

export default function MinBrukerPage() {
  const fullPathname = useFullPathname()
  const searchParams = useSearchParams()
  const session = useSession()

  const linkErrorMessage = searchParams.get("error") ?? null
  const linkStatus = searchParams.get("link_status")
  const isLinkStatusOk = linkStatus === "ok"
  const isLinkStatusFailed = linkStatus === "failed"

  const trpc = useTRPC()

  const { data: auth0Connections, isLoading: auth0ConnectionsIsLoading } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: session?.sub ?? "" }),
    enabled: session !== null,
  })

  if (session === null) {
    redirect(createAuthorizeUrl({ redirectAfter: fullPathname }))
  }

  const isFeideLinked = auth0Connections?.hasFeide === true
  const isUsernamePasswordLinked = auth0Connections?.hasUsernamePassword === true

  const linkFeideUrl = createAbsoluteLinkIdentityAuthorizeUrl(window.location.origin, {
    connection: "FEIDE",
    redirectAfter: `${fullPathname}/link`,
  })

  const linkUsernamePasswordUrl = createAbsoluteLinkIdentityAuthorizeUrl(window.location.origin, {
    connection: "Username-Password-Authentication",
    redirectAfter: `${fullPathname}/link`,
  })

  const usernamePasswordLinkButtonProps =
    isUsernamePasswordLinked || auth0ConnectionsIsLoading
      ? { disabled: true }
      : { element: "a", href: linkUsernamePasswordUrl }

  const feideLinkButtonProps =
    isFeideLinked || auth0ConnectionsIsLoading ? { disabled: true } : { element: "a", href: linkFeideUrl }

  return (
    <div className="flex flex-col gap-6">
      {isLinkStatusFailed ? (
        <div className="flex flex-row gap-3 items-center bg-red-100 dark:bg-red-900 p-3 rounded-lg">
          <IconX size="1.25em" className="text-red-600 dark:text-red-400" />
          <div className="flex flex-col">
            <Title size="sm" className="text-sm">
              Koblingen feilet
            </Title>
            <Text className="text-xs">Kunne ikke koble sammen kontoene. Kontakt dotkom dersom problemet vedvarer.</Text>
            {linkErrorMessage ? (
              <Text className="text-xs">Feilmelding: {decodeURIComponent(linkErrorMessage)}</Text>
            ) : null}
          </div>
        </div>
      ) : isLinkStatusOk ? (
        <div className="flex flex-row gap-3 items-center bg-green-100 dark:bg-green-900 p-3 rounded-lg">
          <IconCheck size="1.25em" className="text-green-600 dark:text-green-400" />
          <div className="flex flex-col">
            <Title size="sm" className="text-sm">
              Koblingen er vellykket
            </Title>
            <Text className="text-xs">Du kan nå bruke denne kontoen til å logge inn.</Text>
          </div>
        </div>
      ) : null}

      <Title size="xl">Min bruker</Title>

      <div className="flex flex-col gap-3">
        <Title size="md">E-post</Title>
        <Text>Du kan snart endre e-posten din.</Text>
      </div>

      <div className="flex flex-col gap-3">
        <Title size="md">Innloggingsmetoder</Title>

        <div className="grid grid-cols-[auto_auto] w-fit gap-y-3 gap-x-6 items-center">
          <div className="flex gap-2 items-center">
            <IconPassword size={22} />
            <Text>Passord</Text>
          </div>

          <div className="flex flex-row gap-2">
            <Button className="w-fit" {...usernamePasswordLinkButtonProps}>
              <div className="flex gap-2 items-center">
                <IconLink size="1rem" />
                <Text className="text-sm">Tilknytt</Text>
              </div>
            </Button>
            {isUsernamePasswordLinked && (
              <div className="flex flex-row gap-1 items-center text-xs text-green-600">
                <IconCheck size="1.15em" />
                <Text>Tilkoblet</Text>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <FeideIcon size={22} />
            <Text>FEIDE</Text>
          </div>

          <div className="flex flex-row gap-2">
            <Button className="w-fit" {...feideLinkButtonProps}>
              <div className="flex gap-2 items-center">
                <IconLink size="1rem" />
                <Text className="text-sm">Tilknytt</Text>
              </div>
            </Button>
            {isFeideLinked && (
              <div className="flex flex-row gap-1 items-center text-xs text-green-600">
                <IconCheck size="1.15em" />
                <Text>Tilkoblet</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
