"use client"

import { FeideIcon } from "@/components/icons/FeideIcon"
import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { getSessionRecoveryMessages } from "@dotkomonline/utils"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, Text, TextInput, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl, createLinkIdentityAuthorizeUrl, resolveAuthErrorMessage } from "@dotkomonline/utils"
import { IconAlertTriangle, IconCheck, IconCopy, IconLink, IconMail, IconPassword, IconX } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { redirect, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function MinBrukerPage() {
  const fullPathname = useFullPathname()
  const searchParams = useSearchParams()
  const {
    sessionUser,
    isLoading: authLoading,
    isInvalid,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
    dbUser,
  } = useAuthenticatedUser()

  const [newEmail, setNewEmail] = useState("")
  const { icon: copyEmailIcon, copy: copyEmail } = useCopyToClipboard()

  const linkErrorMessage = resolveAuthErrorMessage(searchParams.get("error"))
  const linkStatus = searchParams.get("link_status")
  const isLinkStatusOk = linkStatus === "ok"
  const isLinkStatusFailed = linkStatus === "failed"
  const returnedFromEmailVerification = searchParams.get("email_verified") === "1"

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: auth0Connections, isLoading: auth0ConnectionsIsLoading } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: sessionUser?.sub ?? "" }),
    enabled: sessionUser != null && !isInvalid,
  })

  const user = dbUser

  const { mutate: synchronizeEmail } = useMutation(
    trpc.user.syncEmailFromAuth0.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.user.getMe.queryOptions())
      },
    })
  )

  const requestEmailChange = useMutation(
    trpc.user.requestEmailChange.mutationOptions({
      onSuccess: () => {
        setNewEmail("")
      },
    })
  )

  // We synchronize the email from Auth0 on mount, so that if the user returns here after clicking a verification link,
  // the DB user also gets updated.
  useEffect(() => {
    if (sessionUser === null || isInvalid) {
      return
    }

    synchronizeEmail()
  }, [sessionUser, isInvalid, synchronizeEmail])

  if (!authLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (!authLoading && isInvalid && sessionRecoveryMessages !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1" size="xl">
          Min bruker
        </Title>
        <SessionRecoveryNotice {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  if (authLoading || sessionUser === null || user === null) {
    return null
  }

  const isFeideLinked = auth0Connections?.hasFeide === true
  const isUsernamePasswordLinked = auth0Connections?.hasUsernamePassword === true

  const linkFeideUrl = createLinkIdentityAuthorizeUrl({
    connection: "FEIDE",
    returnTo: `${fullPathname}/link`,
  })

  const linkUsernamePasswordUrl = createLinkIdentityAuthorizeUrl({
    connection: "Username-Password-Authentication",
    returnTo: `${fullPathname}/link`,
  })

  const usernamePasswordLinkButtonProps =
    isUsernamePasswordLinked || auth0ConnectionsIsLoading
      ? { disabled: true }
      : { element: "a", href: linkUsernamePasswordUrl }

  const feideLinkButtonProps =
    isFeideLinked || auth0ConnectionsIsLoading ? { disabled: true } : { element: "a", href: linkFeideUrl }

  const CopyEmailIcon = copyEmailIcon === "copy" ? IconCopy : IconCheck

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
            {linkErrorMessage !== null ? <Text className="text-xs">{linkErrorMessage}</Text> : null}
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

      <div className="flex flex-col gap-6">
        <Title size="md">E-post</Title>

        {returnedFromEmailVerification && (
          <div className="flex flex-row gap-3 items-center bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <IconCheck size="1.25em" className="text-green-600 dark:text-green-400" />
            <div className="flex flex-col">
              <Title size="sm" className="text-sm">
                E-posten er bekreftet
              </Title>
              <Text className="text-xs">Vi har oppdatert e-posten din.</Text>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Text>Nåværende e-post</Text>
          {user?.email ? (
            <div
              className={cn(
                "flex gap-3 px-3 py-2 h-10 rounded-lg items-center w-fit",
                "bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700"
              )}
            >
              <Text className="text-sm">{user.email}</Text>
              <Button
                variant="unstyled"
                aria-label="Kopier e-postadresse"
                size="sm"
                className="group -m-1.5 p-1.5 rounded-lg transition-colors hover:text-inherit hover:bg-gray-100"
                onClick={() => {
                  if (user.email) {
                    copyEmail(user.email)
                  }
                }}
              >
                <CopyEmailIcon
                  aria-hidden
                  size="1em"
                  className={cn(
                    "shrink-0 transition-colors text-gray-500 dark:text-stone-400 group-hover:text-inherit",
                    copyEmailIcon === "check" && "text-green-600 dark:text-green-400"
                  )}
                />
              </Button>
            </div>
          ) : (
            <div className="h-10 w-28 bg-gray-100 dark:bg-stone-800 rounded-lg animate-pulse" />
          )}
        </div>

        <form
          className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,calc(var(--spacing)*64))_auto] sm:grid-rows-[auto_auto] sm:gap-x-2 sm:gap-y-3 sm:[&>div:first-child]:col-start-1 sm:[&>div:first-child]:grid! sm:[&>div:first-child]:row-span-2 sm:[&>div:first-child]:grid-rows-subgrid"
          onSubmit={(event) => {
            event.preventDefault()

            if (!newEmail) {
              return
            }

            requestEmailChange.mutate({ newEmail })
          }}
        >
          <TextInput
            label="Ny e-post"
            type="email"
            placeholder="min.epost@gmail.com"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="w-full sm:max-w-sm"
            required
          />

          <Button
            type="submit"
            className="w-fit sm:col-start-2 sm:row-start-2"
            disabled={requestEmailChange.isPending || !newEmail}
          >
            <IconMail className="size-4" />
            <Text className="text-sm">Send bekreftelse</Text>
          </Button>
        </form>
      </div>
      {requestEmailChange.isSuccess && (
        <div className="flex items-center gap-2">
          <IconCheck className="size-4 text-green-600 dark:text-green-400" />
          <Text className="text-sm">
            Vi har sendt en bekreftelseslenke. Klikk lenken i e-posten for å bekrefte den nye adressen.
          </Text>
        </div>
      )}
      {requestEmailChange.isError && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <IconAlertTriangle className="size-4" />
          <Text className="text-sm">Kunne ikke sende bekreftelse. Prøv igjen senere.</Text>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Title size="md">Innloggingsmetoder</Title>

        <div className="grid grid-cols-[auto_auto] w-fit gap-y-3 gap-x-6 items-center">
          <div className="flex gap-2 items-center">
            <IconPassword size={22} />
            <Text>Passord</Text>
          </div>

          <div className="flex flex-row gap-2">
            <Button className="w-fit" {...usernamePasswordLinkButtonProps}>
              <IconLink className="size-4" />
              <Text className="text-sm">Tilknytt</Text>
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
              <IconLink className="size-4" />
              <Text className="text-sm">Tilknytt</Text>
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
