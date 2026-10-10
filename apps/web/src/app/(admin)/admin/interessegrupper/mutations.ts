"use client"

import { env } from "@admin/lib/env"
import { useQueryGenericMutationNotification, useQueryNotification } from "@admin/lib/notifications"
import { useTRPC } from "@admin/lib/trpc-client"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateInterestGroupEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  const router = useRouter()

  return useMutation(
    trpc.interestGroupEvent.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter interessegruppearrangement...",
          message: "Interessegruppearrangementet blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Interessegruppearrangement opprettet",
          message: `Interessegruppearrangementet "${data.title}" har blitt opprettet.`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findMany.queryKey(),
        })

        router.push(`/admin/interessegrupper/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppretting av interessegruppearrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateInterestGroupEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.interestGroupEvent.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer interessegruppearrangement...",
          message: "Interessegruppearrangementet blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Interessegruppearrangement oppdatert",
          message: `Interessegruppearrangementet "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.interestGroupEvent.getByIdWithRequest.queryOptions(data.id))
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findMany.queryKey(),
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av interessegruppearrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useReviewInterestGroupEventRequestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryGenericMutationNotification({ method: "update" })

  return useMutation(
    trpc.interestGroupEvent.reviewRequest.mutationOptions({
      onMutate: () => {
        notification.loading()
      },
      onSuccess: async (data) => {
        notification.complete()

        await queryClient.invalidateQueries(trpc.interestGroupEvent.getByIdWithRequest.queryOptions(data.id))
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequest.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findMany.queryKey(),
        })
      },
      onError: (err) => {
        notification.fail(err)
      },
    })
  )
}

export const useInterestGroupEventImageUpload = () => {
  const trpc = useTRPC()
  const createFileUpload = useMutation(trpc.interestGroupEvent.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUpload.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
