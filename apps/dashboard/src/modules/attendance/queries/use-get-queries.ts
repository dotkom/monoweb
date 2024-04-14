import type { AttendanceId } from "@dotkomonline/types"
import { useQueryNotification } from "src/app/notifications"
import { trpc } from "../../../utils/trpc"

export const usePoolsGetQuery = (id: AttendanceId) => {
  const { data: pools = [], ...query } = trpc.event.attendance.getPoolsByAttendanceId.useQuery({
    id,
  })
  return { pools, ...query }
}

export const useAttendanceGetQuery = (id: AttendanceId, enabled?: boolean) => {
  const { data, isLoading } = trpc.event.attendance.getAttendance.useQuery(
    {
      id,
    },
    {
      enabled,
    }
  )
  return { data, isLoading }
}

export const useEventAttendeesGetQuery = (id: AttendanceId) => {
  const { data: attendees = [], ...query } = trpc.event.attendance.getAttendees.useQuery({
    id,
  })
  return { attendees, ...query }
}

export const useWaitlistAttendeesGetQuery = (id: AttendanceId) => {
  const { data: attendees = [], ...query } = trpc.attendance.getWaitlist.useQuery({
    id,
  })
  return { attendees, ...query }
}

export const useHandleQrCodeRegistration = () => {
  const notification = useQueryNotification()
  const mutation = trpc.event.attendance.handleQrCodeRegistration.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Registrerer bruker",
        message: "Brukeren blir registrert på arrangementet.",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Registrering vellykket",
        message: "Bruker ble registrert på arrangementet.",
      })
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under registrering: ${err.toString()}.`,
      })
    },
  })
  return mutation.mutateAsync
}
