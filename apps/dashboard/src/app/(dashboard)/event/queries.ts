import type { AttendanceId, EventId } from "@dotkomonline/types"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTRPC } from "../../../trpc"
import { useQueryNotification } from "../../notifications"
import { openAttendanceRegisteredModal } from "./components/attendance-registered-modal"
import { openAlreadyAttendedModal } from "./components/error-attendance-registered-modal"

export const useEventAllQuery = () => {
  const trpc = useTRPC()
  const { data: events, ...query } = useQuery(trpc.event.all.queryOptions({ page: { take: 50 } }, { initialData: [] }))
  return { events, ...query }
}

export const useEventCompanyGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data: eventCompanies, ...query } = useQuery(
    trpc.event.company.get.queryOptions(
      {
        id,
      },
      { initialData: [] }
    )
  )
  return { eventCompanies, ...query }
}

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.event.getAttendanceEventDetail.queryOptions(id))
  return { data, ...query }
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
  const { data: attendees, ...query } = useQuery(
    trpc.event.attendance.getAttendees.queryOptions(
      {
        id,
      },
      { initialData: [] }
    )
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
