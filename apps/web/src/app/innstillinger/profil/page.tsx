"use client"

import { SessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice"
import { getSessionRecoveryMessages } from "@dotkomonline/utils"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowLeft } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { redirect } from "next/navigation"
import { type FormUserWrite, ProfileForm } from "./form"
import SkeletonProfileForm from "./loading"

const EditProfilePage = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const fullPathname = useFullPathname()
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
        await Promise.allSettled([
          queryClient.invalidateQueries(trpc.user.getByUsername.queryOptions(data.username)),
          queryClient.invalidateQueries(trpc.user.findByUsername.queryOptions(data.username)),
          queryClient.invalidateQueries(trpc.user.getMe.queryOptions()),
          queryClient.invalidateQueries(trpc.user.findMe.queryOptions()),
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
    </div>
  )
}

export default EditProfilePage
