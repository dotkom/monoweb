import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { env } from "@/lib/env"
import { useQueryGenericMutationNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"

export const useUpdateUserMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.user.update.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
        await queryClient.invalidateQueries({ queryKey: trpc.user.all.queryKey() })
        await queryClient.invalidateQueries(trpc.workspace.findUser.queryOptions({ userId: data.id }))
      },
    })
  )
}

export const useCreateMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.user.createMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
      },
    })
  )
}

export const useUpdateMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.user.updateMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
      },
    })
  )
}

export const useDeleteMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.user.deleteMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(data.id))
      },
    })
  )
}

export const useLinkOwUserToWorkspaceUserMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.workspace.linkUser.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.user.get.queryOptions(input.userId))
        await queryClient.invalidateQueries(trpc.workspace.findUser.queryOptions({ userId: input.userId }))
        await queryClient.invalidateQueries({ queryKey: trpc.user.all.queryKey() })
      },
    })
  )
}

export const useUserFileUploadMutation = () => {
  const trpc = useTRPC()

  const createFileUploadMutation = useMutation(trpc.user.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
