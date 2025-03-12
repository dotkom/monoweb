import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useAddCompanyToEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.company.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Legger til bedrift...",
          message: "Legger til bedriften som arrangør av dette arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Bedrift lagt til",
          message: "Bedriften har blitt lagt til arrangørlisten.",
        })
      },
    })
  )
}
