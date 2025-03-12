import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

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

        router.push(`/company/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av bedriften: ${err.toString()}.`,
        })

        // TODO: send error to sentry/other service so we can catch it
      },
    })
  )
}
