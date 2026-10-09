"use client"

import { CalendarSubscriptionPanel } from "@/app/arrangementer/components/CalendarSubscriptionPanel"
import { getUserIcons, getUserPlate } from "@/app/arrangementer/components/AttendanceCard/AttendeeList/UserPlate"
import { FeideIcon } from "@/components/icons/FeideIcon"
import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { Auth0ProviderSchema, findActiveMembership, type User } from "@dotkomonline/rpc/user"
import { getSessionRecoveryMessages, getStudyGrade } from "@dotkomonline/utils"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useIdentityLinkRequiresLogin } from "@/components/notices/identity-link-success-notice"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { useFeideLinkNudge } from "@/utils/use-feide-link-nudge"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, Text, TextInput, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl, createLinkIdentityAuthorizeUrl, resolveAuthErrorMessage } from "@dotkomonline/utils"
import {
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconCheck,
  IconCopy,
  IconEyeOff,
  IconLink,
  IconMail,
  IconPassword,
  IconX,
} from "@tabler/icons-react"
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
  const identityLinkRequiresLogin = useIdentityLinkRequiresLogin()

  const { icon: copyEmailIcon, copy: copyEmail } = useCopyToClipboard()

  const linkErrorMessage = resolveAuthErrorMessage(searchParams.get("error"))
  const linkStatus = searchParams.get("link_status")
  const isLinkStatusOk = linkStatus === "ok"
  const isLinkStatusFailed = linkStatus === "failed"
  const returnedFromEmailVerification = searchParams.get("email_verified") === "1"

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { showNudge: showFeideLinkNudge, duplicateUserId, dismissNudge: dismissFeideLinkNudge } = useFeideLinkNudge()

  const duplicateUserQuery = useQuery({
    ...trpc.user.get.queryOptions(duplicateUserId ?? ""),
    enabled: duplicateUserId !== undefined,
  })

  const { data: auth0Connections, isLoading: auth0ConnectionsIsLoading } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: sessionUser?.sub ?? "" }),
    enabled: sessionUser != null && !isInvalid && !identityLinkRequiresLogin,
  })

  const isFeideLinked = auth0Connections?.hasFeide === true
  const isUsernamePasswordLinked = auth0Connections?.hasUsernamePassword === true
  const hasLoadedAuth0Connections = auth0Connections !== undefined && !auth0ConnectionsIsLoading
  const bothLoginMethodsLinked = hasLoadedAuth0Connections && isUsernamePasswordLinked && isFeideLinked

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
      onSuccess: async (result) => {
        setNewEmail("")

        if (!result.verificationSent) {
          await queryClient.invalidateQueries(trpc.user.getMe.queryOptions())
        }
      },
    })
  )

  // We synchronize the email from Auth0 on mount, so that if the user returns here after clicking a verification link,
  // the DB user also gets updated.
  useEffect(() => {
    if (sessionUser === null || isInvalid || identityLinkRequiresLogin) {
      return
    }

    synchronizeEmail()
  }, [sessionUser, isInvalid, identityLinkRequiresLogin, synchronizeEmail])

  if (!authLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  if (identityLinkRequiresLogin) {
    return null
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (!authLoading && isInvalid && sessionRecoveryMessages !== null && !identityLinkRequiresLogin) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1" size="xl">
          Min bruker
        </Title>
        <SessionRecoveryNotice {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  if (authLoading || sessionUser == null || user === null) {
    return null
  }

  const showPasswordLinkNudge = showFeideLinkNudge && hasLoadedAuth0Connections && !isUsernamePasswordLinked
  const showFeideLinkHighlight = showFeideLinkNudge && hasLoadedAuth0Connections && !isFeideLinked
  const showDuplicateAccountNotice = showFeideLinkNudge && !bothLoginMethodsLinked
  const canVerifyEmailViaAuth0 = sessionUser.sub?.startsWith(Auth0ProviderSchema.enum.auth0) === true

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

      <div className="flex flex-col gap-12">
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
            <Text className="text-sm">Nåværende e-post</Text>
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
              className="w-fit h-full sm:col-start-2 sm:row-start-2"
              disabled={requestEmailChange.isPending || !newEmail}
            >
              <IconMail className="size-4" />
              <Text className="text-sm">{canVerifyEmailViaAuth0 ? "Send bekreftelse" : "Lagre e-post"}</Text>
            </Button>
          </form>
        </div>
        {requestEmailChange.isSuccess && requestEmailChange.data.verificationSent && (
          <div className="flex items-center gap-2">
            <IconCheck className="size-4 text-green-600 dark:text-green-400" />
            <Text className="text-sm">
              Vi har sendt en bekreftelseslenke. Klikk lenken i e-posten for å bekrefte den nye adressen.
            </Text>
          </div>
        )}
        {requestEmailChange.isSuccess && !requestEmailChange.data.verificationSent && (
          <div className="flex items-center gap-2">
            <IconCheck className="size-4 text-green-600 dark:text-green-400" />
            <Text className="text-sm">E-posten er oppdatert.</Text>
          </div>
        )}
        {requestEmailChange.isError && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <IconAlertTriangle className="size-4" />
            <Text className="text-sm">Kunne ikke oppdatere e-posten. Prøv igjen senere.</Text>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <Title size="md">Innloggingsmetoder</Title>

          {showDuplicateAccountNotice && (
            <div className="flex max-w-xl flex-col gap-2">
              <div
                className={cn(
                  "grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg p-4",
                  "bg-yellow-100/66 dark:bg-yellow-900/25"
                )}
              >
                <IconAlertTriangleFilled className="size-5 shrink-0 text-yellow-800 dark:text-yellow-400" />
                <Title element="p" className="text-base text-yellow-800 dark:text-yellow-400">
                  Vi tror du har to kontoer
                </Title>

                <div className="col-span-2 grid grid-cols-subgrid gap-2">
                  <Text className="col-start-2 text-sm font-medium">Er dette deg?</Text>

                  {duplicateUserQuery.isLoading && <DuplicateUserPlateSkeleton />}
                  {duplicateUserQuery.data !== undefined && (
                    <div className="col-start-2 min-w-0 bg-background rounded-full p-1 -ml-3">
                      <DuplicateUserPlate user={duplicateUserQuery.data} />
                    </div>
                  )}
                </div>

                <Text className="col-start-2 text-sm font-medium inline-flex gap-1.5">
                  <IconLink className="size-4 self-center" />
                  Tilknytt kontoen for å slå dem sammen til én.
                </Text>

                <Text className="col-start-2 text-sm text-pretty text-muted-foreground">
                  En Onliner skal bare ha én konto. Med to kontoer kan du ende opp med å betale to ganger for det samme
                  arrangementet, eller få prikker for å ikke møte opp selv om du var der.
                </Text>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={dismissFeideLinkNudge}
                className="w-fit px-2 -mx-2 text-muted-foreground hover:text-foreground"
              >
                <IconEyeOff className="size-3.5" />
                Dette er feil, skjul
              </Button>
            </div>
          )}

          <div className="grid grid-cols-[auto_auto] w-fit gap-y-3 gap-x-6 items-center">
            <div className="flex gap-2 items-center">
              <IconPassword size={22} />
              <Text>Passord</Text>
            </div>

            <div className="flex flex-col gap-2">
              {isUsernamePasswordLinked ? (
                <ConnectedLoginMethod />
              ) : (
                <Button
                  className={cn(
                    "w-fit",
                    showPasswordLinkNudge && "ring-2 ring-red-600 dark:ring-red-400 ring-offset-2"
                  )}
                  {...usernamePasswordLinkButtonProps}
                >
                  <IconLink className="size-4.5" />
                  <Text className="text-sm">Tilknytt</Text>
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <FeideIcon size={22} />
              <Text>FEIDE</Text>
            </div>

            <div className="flex flex-col gap-2">
              {isFeideLinked ? (
                <ConnectedLoginMethod />
              ) : (
                <Button
                  className={cn("w-fit", showFeideLinkHighlight && "ring-2 ring-red-500 ring-offset-2")}
                  {...feideLinkButtonProps}
                >
                  <IconLink className="size-4.5" />
                  <Text className="text-sm">Tilknytt</Text>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Title size="md" id="kalender" className="scroll-mt-24">
            Kalender
          </Title>

          <div className="w-full max-w-96 rounded-xl border border-field-border bg-background p-4">
            <CalendarSubscriptionPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectedLoginMethod() {
  return (
    <div className="flex flex-row items-center gap-1.5 ml-3">
      <IconCheck className="size-4.5 text-green-600" />
      <Text className="text-sm">Tilkoblet</Text>
    </div>
  )
}

function DuplicateUserPlateSkeleton() {
  return (
    <div className="col-start-2 -ml-3 flex items-center gap-4 rounded-full bg-background p-1.75">
      <div className="size-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-stone-700" />
      <div className="h-4 w-36 animate-pulse rounded-full bg-gray-200 dark:bg-stone-700" />
    </div>
  )
}

function DuplicateUserPlate({ user }: { user: User }) {
  const membership = findActiveMembership(user)
  const userGrade = membership?.semester != null ? getStudyGrade(membership.semester) : null
  const UserPlate = getUserPlate(user)
  const { largeIcon, smallIcons } = getUserIcons(user)

  return (
    <UserPlate
      attendee={{ userId: user.id, userGrade }}
      user={user}
      smallIcons={smallIcons}
      largeIcon={largeIcon}
      isCurrentUser={false}
    />
  )
}
