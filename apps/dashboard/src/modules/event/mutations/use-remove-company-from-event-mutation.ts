import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useRemoveCompanyFromEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.company.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Fjerner bedrift",
          message: "Fjerner bedriften fra arrangørlisten til dette arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Bedrift fjernet",
          message: "Bedriften har blitt fjernet fra arrangørlisten.",
        })
      },
    })
  )
}
