import type { AttendanceId } from "@dotkomonline/types"
import { useQueryNotification } from "src/app/notifications"
import { useTRPC } from "../../../trpc"
import { openAttendanceRegisteredModal } from "../modals/attendance-registered-modal"
import { openAlreadyAttendedModal } from "../modals/error-attendance-registered-modal"

import { useQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"

export const usePoolsGetQuery = (id: AttendanceId) => {
  const trpc = useTRPC()
  const { data: pools = [], ...query } = useQuery(
    trpc.event.attendance.getPoolsByAttendanceId.queryOptions({
      id,
    })
  )
  return { pools, ...query }
}

export const useAttendanceGetQuery = (id: AttendanceId, enabled?: boolean) => {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      {
        id,
      },
      {
        enabled,
      }
    )
  )
  return { data, isLoading }
}

export const useEventAttendeesGetQuery = (id: AttendanceId) => {
  const trpc = useTRPC()
  const { data: attendees = [], ...query } = useQuery(
    trpc.event.attendance.getAttendees.queryOptions({
      id,
    })
  )
  return { attendees, ...query }
}

export const useWaitlistAttendeesGetQuery = (id: AttendanceId) => {
  const trpc = useTRPC()
  const { data: attendees = [], ...query } = useQuery(
    trpc.attendance.getWaitlist.queryOptions({
      id,
    })
  )
  return { attendees, ...query }
}

export const useHandleQrCodeRegistration = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  const mutation = useMutation(
    trpc.event.attendance.handleQrCodeRegistration.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Registrerer bruker",
          message: "Brukeren blir registrert på arrangementet.",
        })
      },
      onSuccess: (data) => {
        if (data.alreadyAttended) {
          openAlreadyAttendedModal({ user: data.user })()
          notification.fail({
            title: "Registrering feilet",
            message: "Brukeren er allerede registrert på arrangementet.",
          })
        } else {
          openAttendanceRegisteredModal({ user: data.user })()
          notification.complete({
            title: "Registrering vellykket",
            message: "Bruker ble registrert på arrangementet.",
          })
        }
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under registrering: ${err.toString()}.`,
        })
      },
    })
  )
  return mutation.mutateAsync
}
