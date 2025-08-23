"use client"
import { useTRPC } from "@/utils/trpc/client"
import type { UserWrite } from "@dotkomonline/types"
import { Button, Icon, Title } from "@dotkomonline/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProfileForm, SkeletonProfileForm } from "./form"

const EditProfilePage = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: user, isLoading: userIsLoading } = useQuery(trpc.user.findMe.queryOptions())

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

  if (userIsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between">
          <Title element="h1" size="xl">
            Rediger profil
          </Title>

          <div className="w-24 h-9 rounded-md bg-gray-300 dark:bg-stone-700 animate-pulse" />
        </div>

        <SkeletonProfileForm />
      </div>
    )
  }

  if (!user) {
    notFound()
  }

  const onSubmit = (data: UserWrite) => {
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
          icon={<Icon icon="tabler:arrow-left" />}
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
