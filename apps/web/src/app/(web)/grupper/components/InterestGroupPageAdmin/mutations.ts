"use client"

import { useTRPC } from "@/utils/trpc/client"

import { toast } from "@dotkomonline/ui"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { env } from "src/env"

export const useCreateInterestGroupEventRequest = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const toastId = "create-interest-group-event-request"

  return useMutation(
    trpc.interestGroupEvent.createRequest.mutationOptions({
      onMutate: () => {
        toast.add({
          type: "loading",
          title: "Sender søknad...",
          id: toastId,
        })
      },
      onSuccess: async () => {
        toast.update(toastId, {
          type: "success",
          title: "Søknad sendt",
          description: "Søknaden har blitt sendt til Backlog.",
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.interestGroupEvent.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
        })
      },
      onError: () => {
        toast.update(toastId, {
          type: "error",
          title: "Kunne ikke sende søknad",
          description: `En feil oppsto under sending av søknad. Prøv igjen.`,
        })
      },
    })
  )
}

export const useInterestGroupEventImageUpload = (interestGroupId: string) => {
  const trpc = useTRPC()
  const createFileUpload = useMutation(trpc.interestGroupEvent.createFileUploadForGroup.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUpload.mutateAsync({
      filename: file.name,
      contentType: file.type,
      interestGroupId,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
