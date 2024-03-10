import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useRegisterForEventMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.attendance.registerForEvent.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Melder på bruker",
        message: "Brukeren blir meldt på arrangementet.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Påmelding vellykket",
        message: `Bruker ${data.userId} ble påmeldt arrangementet.`,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under påmelding: ${err.toString()}.`,
      })
    },
  })
}

export const useDeregisterForEventMutation = () => {
  const notification = useQueryNotification()

  return trpc.event.attendance.deregisterForEvent.useMutation({
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
}

export const useUpdateEventAttendanceMutation = () => {
  const notification = useQueryNotification()
  return trpc.event.attendance.registerAttendance.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer oppmøte...",
        message: "Brukerens oppmøte blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Oppmøte oppdatert",
        message: `Oppmøte er ${data.attended ? "registrert" : "fjernet"} for bruker ${data.user.name}. `,
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av oppmøte: ${err.toString()}.`,
      })
    },
  })
}
