import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTRPC } from "../../../trpc"
import { useQueryNotification } from "../../notifications"

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

export const useCreateEventMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter arrangement...",
          message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Arrangement opprettet",
          message: `Arrangementet "${data.title}" har blitt opprettet.`,
        })

        router.push(`/event/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useEditEventWithGroupsMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.editWithGroups.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer arrangement...",
          message: "Arrangementet blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Arrangement oppdatert",
          message: `Arrangementet "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

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
