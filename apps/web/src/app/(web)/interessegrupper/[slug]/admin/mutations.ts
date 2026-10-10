"use client"

import { useTRPC } from "@/utils/trpc/client"

import { toast } from "@dotkomonline/ui"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { env } from "@/env"

export const useCreateSidequestRequest = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const toastId = "create-sidequest-request"

  return useMutation(
    trpc.sidequest.createRequest.mutationOptions({
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
          queryKey: trpc.sidequest.findManyWithRequestByInterestGroupId.infiniteQueryKey(),
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

export const useSidequestImageUpload = (interestGroupId: string) => {
  const trpc = useTRPC()
  const createFileUpload = useMutation(trpc.sidequest.createFileUploadForGroup.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUpload.mutateAsync({
      filename: file.name,
      contentType: file.type,
      interestGroupId,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
