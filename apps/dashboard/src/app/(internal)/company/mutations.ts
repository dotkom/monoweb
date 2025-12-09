import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { env } from "@/lib/env"
import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"

export const useCreateCompanyMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.company.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter bedrift...",
          message: "Bedriften blir opprettet, og du vil bli videresendt til bedriftsiden.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Bedrift opprettet",
          message: `Bedriften "${data.name}" har blitt opprettet.`,
        })

        router.replace(`/company/${data.slug}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av bedriften: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useEditCompanyMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.company.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer bedrift...",
          message: "Bedriften blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Bedrift oppdatert",
          message: `Bedriften "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.company.getBySlug.queryOptions(data.slug))
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av bedriften: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useCompanyFileUploadMutation = () => {
  const trpc = useTRPC()

  const createFileUploadMutation = useMutation(trpc.company.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
