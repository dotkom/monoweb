import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useCreateGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter gruppe...",
          message: "Gruppen blir opprettet.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Gruppen er opprettet",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
        })
      },
    })
  )
}
