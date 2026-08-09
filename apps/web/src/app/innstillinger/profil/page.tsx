"use client"

import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { getSessionRecoveryMessages } from "@dotkomonline/utils"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowLeft, IconX } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useState } from "react"
import { type FormUserWrite, ProfileForm } from "./form"
import SkeletonProfileForm from "./loading"

function getFadderukePointsToastMessage(pointsAwarded: number, teamBonusAwarded: number) {
  if (teamBonusAwarded > 0 && pointsAwarded > 0) {
    return `${pointsAwarded} poeng til laget, pluss ${teamBonusAwarded} i lagbonus!`
  }

  if (teamBonusAwarded > 0) {
    return `Hele laget er ferdig! ${teamBonusAwarded} bonuspoeng til laget.`
  }

  return `${pointsAwarded} poeng til laget ditt!`
}

const EditProfilePage = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const fullPathname = useFullPathname()
  const [pointsToastMessage, setPointsToastMessage] = useState<string | null>(null)
  const {
    sessionUser,
    isLoading: authLoading,
    isInvalid,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
    dbUser,
  } = useAuthenticatedUser()

  const userEdit = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: async (data) => {
        const totalPointsAwarded = data.fadderukeContestPointsAwarded + data.fadderukeTeamBonusAwarded

        if (totalPointsAwarded > 0) {
          setPointsToastMessage(
            getFadderukePointsToastMessage(data.fadderukeContestPointsAwarded, data.fadderukeTeamBonusAwarded)
          )
        }

        await Promise.allSettled([
          queryClient.invalidateQueries(trpc.user.getByUsername.queryOptions(data.user.username)),
          queryClient.invalidateQueries(trpc.user.findByUsername.queryOptions(data.user.username)),
          queryClient.invalidateQueries(trpc.user.getMe.queryOptions()),
          queryClient.invalidateQueries(trpc.user.findMe.queryOptions()),
          queryClient.invalidateQueries(trpc.fadderuke.getMyContestProfileProgress.queryOptions()),
        ])
      },
    })
  )

  if (!authLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (!authLoading && isInvalid && sessionRecoveryMessages !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Title element="h1" size="xl">
          Rediger profil
        </Title>
        <SessionRecoveryNotice {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  if (authLoading || sessionUser === null || dbUser === null) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between">
          <Title element="h1" size="xl">
            Rediger profil
          </Title>

          <div className="w-24 h-9 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
        </div>

        <SkeletonProfileForm />
      </div>
    )
  }

  const onSubmit = (data: FormUserWrite) => {
    userEdit.mutate({ id: dbUser.id, input: data })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <Title element="h1" size="xl">
          Rediger profil
        </Title>

        <Button
          element={Link}
          href={`/profil/${dbUser.username}`}
          icon={<IconArrowLeft className="size-5" />}
          className="w-fit"
        >
          Til profil
        </Button>
      </div>

      <ProfileForm
        user={dbUser}
        onSubmit={onSubmit}
        isSaving={userEdit.isPending}
        saveError={userEdit.error?.message}
        saveSuccess={userEdit.isSuccess}
        resetSaveState={userEdit.reset}
      />

      {pointsToastMessage ? (
        <div
          className={cn(
            "fixed bottom-12 sm:bottom-6 inset-x-3 mx-auto z-50 flex max-w-sm items-center gap-3 rounded-lg",
            "border border-green-300/60",
            "bg-green-100 p-3 shadow-lg dark:border-green-500/20 dark:bg-green-950/90"
          )}
        >
          <Image
            src="/fadderuke-2026-torch.svg"
            alt=""
            width={20}
            height={20}
            draggable={false}
            className="size-10 sm:size-6.5 sm:-ml-1 sm:-my-1.5 sm:-mr-1.5 shrink-0 object-contain select-none"
          />
          <Text className="min-w-0 flex-1 text-base sm:text-sm font-medium text-green-900 dark:text-green-100">
            {pointsToastMessage}
          </Text>
          <button
            type="button"
            onClick={() => setPointsToastMessage(null)}
            className="shrink-0 rounded-sm p-1 sm:p-0.5 text-green-800 transition-colors hover:bg-green-200/80 dark:text-green-200 dark:hover:bg-green-900/60"
            aria-label="Lukk"
          >
            <IconX className="size-5 sm:size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default EditProfilePage
