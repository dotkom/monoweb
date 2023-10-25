import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useUpdateEventAttendanceMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
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
        message: `Oppmøte er ${data.attended ? "registrert" : "fjernet"} for bruker ${data.userId}.`,
      })
      utils.event.attendance.get.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av oppmøte: ${err.toString()}.`,
      })
    },
  })
}
