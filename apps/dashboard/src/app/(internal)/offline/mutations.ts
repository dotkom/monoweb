import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useRouter } from "next/navigation"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { env } from "@/lib/env"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"

export const useCreateOfflineMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.offline.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter offline-utgave...",
          message: "Offline-utgaven blir opprettet, og du vil bli videresendt til offline-utgaven.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Offline-utgave opprettet",
          message: `Offline-utgaven "${data.title}" har blitt opprettet.`,
        })

        await queryClient.invalidateQueries(trpc.offline.all.queryOptions())

        router.replace(`/offline/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelsen av offline-utgaven: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useEditOfflineMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.offline.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer offline-utgaven...",
          message: "Offline-utgaven blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Offline-utgave oppdatert",
          message: `Offline-utgaven "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.offline.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.offline.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av offline-utgaven: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useOfflineFileUploadMutation = () => {
  const trpc = useTRPC()

  const createFileUploadMutation = useMutation(trpc.offline.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}

export const useOfflineImageUploadMutation = () => {
  const trpc = useTRPC()

  const createImageUploadMutation = useMutation(trpc.offline.createImageUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createImageUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
