"use client"

import { env } from "@admin/lib/env"
import { useQueryGenericMutationNotification, useQueryNotification } from "@admin/lib/notifications"
import { useTRPC } from "@admin/lib/trpc-client"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateSidequestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  const router = useRouter()

  return useMutation(
    trpc.sidequest.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter Sidequest...",
          message: "Sidequest blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Sidequest opprettet",
          message: `Sidequest "${data.title}" har blitt opprettet.`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findMany.queryKey(),
        })

        router.push(`/admin/sidequests/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppretting av Sidequest: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateSidequestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.sidequest.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer Sidequest...",
          message: "Sidequest blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Sidequest oppdatert",
          message: `Sidequest "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.sidequest.getByIdWithRequest.queryOptions(data.id))
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findMany.queryKey(),
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av Sidequest: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useReviewSidequestRequestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryGenericMutationNotification({ method: "update" })

  return useMutation(
    trpc.sidequest.reviewRequest.mutationOptions({
      onMutate: () => {
        notification.loading()
      },
      onSuccess: async (data) => {
        notification.complete()

        await queryClient.invalidateQueries(trpc.sidequest.getByIdWithRequest.queryOptions(data.id))
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.sidequest.findMany.queryKey(),
        })
      },
      onError: (err) => {
        notification.fail(err)
      },
    })
  )
}

export const useSidequestImageUpload = () => {
  const trpc = useTRPC()
  const createFileUpload = useMutation(trpc.sidequest.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUpload.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
