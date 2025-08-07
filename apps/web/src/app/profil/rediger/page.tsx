"use client"
import { useTRPC } from "@/utils/trpc/client"
import type { UserWrite } from "@dotkomonline/types"
import { Button, Icon, Title } from "@dotkomonline/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { ProfileForm } from "./form"

const Page = () => {
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
      onError: (err) => console.error("update failed:", err),
    })
  )

  if (userIsLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    notFound()
  }

  const onSubmit = (data: UserWrite) => {
    console.log("Submitting user data:", data)
    userEdit.mutate({ id: user.id, input: data })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          element="a"
          href={`/profil/${user.profileSlug}`}
          icon={<Icon icon="tabler:arrow-left" />}
          className="w-fit"
        >
          Til profil
        </Button>
        <Title element="h1" size="xl">
          Rediger profil
        </Title>
      </div>
      <ProfileForm user={user} onSubmit={onSubmit} />
    </div>
  )
}

export default Page
