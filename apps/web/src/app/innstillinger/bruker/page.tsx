"use client"

import { FeideIcon } from "@/components/icons/FeideIcon"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAbsoluteLinkIdentityAuthorizeUrl, createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck, IconLink, IconPassword } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"

export default function MinBrukerPage() {
  const session = useSession()
  const fullPathname = useFullPathname()

  const trpc = useTRPC()

  const { data: auth0Connections } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: session?.sub ?? "" }),
    enabled: session !== null,
  })

  if (session === null) {
    redirect(createAuthorizeUrl({ redirectAfter: fullPathname }))
  }

  const isFeideLinked = auth0Connections?.hasFeide ?? false
  const isUsernamePasswordLinked = auth0Connections?.hasUsernamePassword ?? false

  const linkFeideUrl = createAbsoluteLinkIdentityAuthorizeUrl(window.location.origin, {
    connection: "FEIDE",
    redirectAfter: `${fullPathname}/link`,
  })

  const linkUsernamePasswordUrl = createAbsoluteLinkIdentityAuthorizeUrl(window.location.origin, {
    connection: "Username-Password-Authentication",
    redirectAfter: `${fullPathname}/link`,
  })

  const usernamePasswordLinkButtonProps = isUsernamePasswordLinked
    ? { disabled: true }
    : { element: "a", href: linkUsernamePasswordUrl }

  const feideLinkButtonProps = isFeideLinked ? { disabled: true } : { element: "a", href: linkFeideUrl }

  return (
    <div className="flex flex-col gap-6">
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
