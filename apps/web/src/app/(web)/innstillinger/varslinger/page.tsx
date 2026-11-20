"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl, getSessionRecoveryMessages } from "@dotkomonline/utils"
import { IconInfoCircleFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useNotificationSettingsUpdateMutation } from "../mutations"
import { NotificationSettingsForm } from "./form"

export default function NotificationSettingsPage() {
  const fullPathname = useFullPathname()
  const { sessionUser, dbUser, isLoading, isInvalid, isSessionInvalid, isMissingDbUser, isDbUserFetchError } =
    useAuthenticatedUser()
  const trpcClient = useTRPC()
  const settingsMutation = useNotificationSettingsUpdateMutation()
  const settingsQuery = useQuery(
    trpcClient.notification.getMySettings.queryOptions(undefined, {
      enabled: !isLoading && !isInvalid && dbUser !== null,
      refetchOnWindowFocus: false,
    })
  )

  if (!isLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (!isLoading && isInvalid && sessionRecoveryMessages !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1">Varslingsinnstillinger</Title>
        <SessionRecoveryNotice {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  if (settingsQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-6">
        <Title element="h1" size="xl">
          Varslingsinnstillinger
        </Title>
        <Text role="alert">Kunne ikke laste varslingsinnstillingene.</Text>
        <Button onClick={() => void settingsQuery.refetch()}>Prøv igjen</Button>
      </div>
    )
  }

  if (isLoading || dbUser === null || settingsQuery.data === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1" size="xl">
          Varslingsinnstillinger
        </Title>
        <Text role="status">Laster varslingsinnstillinger…</Text>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 w-full max-w-2xl flex-col gap-6 wrap-anywhere">
      <div className="flex flex-col gap-2">
        <Title element="h1" size="xl">
          Varslingsinnstillinger
        </Title>
        <Text className="text-muted-foreground">Velg hvordan du ønsker å motta dine varslinger.</Text>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm dark:bg-stone-900/40">
        <IconInfoCircleFilled aria-hidden className="size-5 shrink-0 text-muted-foreground" />

        <Text>Push-varslinger på mobil kommer snart!</Text>
      </div>

      <NotificationSettingsForm
        settings={settingsQuery.data}
        onUpdate={settingsMutation.mutateAsync}
        isSaving={settingsMutation.isPending}
        isSaveSuccessful={settingsMutation.isSuccess}
        saveError={settingsMutation.error?.message}
        resetSaveState={settingsMutation.reset}
      />
    </div>
  )
}
