import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useRegisterForEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder på bruker",
          message: "Brukeren blir meldt på arrangementet.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Påmelding vellykket",
          message: "Bruker ble påmeldt arrangementet.",
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under påmelding: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeregisterForEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.adminDeregisterForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder av bruker",
          message: "Brukeren blir meldt av arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Avmelding vellykket",
          message: "Bruker ble meldt av arrangementet.",
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under avmelding: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateEventAttendanceMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.attendance.registerAttendance.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer oppmøte...",
          message: "Brukerens oppmøte blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Oppmøte oppdatert",
          message: `Oppmøte er ${data.attended ? "registrert" : "fjernet"}. `,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av oppmøte: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateSelectionResponsesMutation = () => {
  const notification = useQueryNotification()
  const trpc = useTRPC()
  return useMutation(
    trpc.attendance.updateSelectionResponses.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer svar...",
          message: "Brukerens svar blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Svar oppdatert",
          message: "Svar er oppdatert",
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: "En feil oppsto under oppdatering av svar",
        })
      },
    })
  )
}
