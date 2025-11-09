"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import type { UserWrite } from "@dotkomonline/types"
import { Button, Icon, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProfileForm } from "./form"
import SkeletonProfileForm from "./loading"
import { IconArrowLeft } from "@tabler/icons-react"

const EditProfilePage = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const session = useSession()
  const fullPathname = useFullPathname()

  if (!session) {
    redirect(createAuthorizeUrl({ redirectAfter: fullPathname }))
  }

  const { data: user, isLoading: userIsLoading } = useQuery(trpc.user.getMe.queryOptions())

  const userEdit = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.user.getByProfileSlug.queryOptions(data.profileSlug)),
          queryClient.invalidateQueries(trpc.user.findByProfileSlug.queryOptions(data.profileSlug)),
          queryClient.invalidateQueries(trpc.user.getMe.queryOptions()),
          queryClient.invalidateQueries(trpc.user.findMe.queryOptions()),
        ])
      },
    })
  )

  if (userIsLoading || user === undefined) {
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

  const onSubmit = (data: Omit<UserWrite, "workspaceUserId">) => {
    userEdit.mutate({ id: user.id, input: data })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <Title element="h1" size="xl">
          Rediger profil
        </Title>

        <Button
          element={Link}
          href={`/profil/${user.profileSlug}`}
          icon={<IconArrowLeft className="w-5 h-5" />}
          className="w-fit"
        >
          Til profil
        </Button>
      </div>

      <ProfileForm
        user={user}
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
