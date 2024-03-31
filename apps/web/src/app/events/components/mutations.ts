import { trpc } from "@/utils/trpc/client"
import {Session} from "next-auth";

interface UnregisterProps {
  attendanceId: string
  user: Session["user"]
}
export const useUnregisterMutation = ({ attendanceId, user }: UnregisterProps) => {
  const utils = trpc.useUtils()
  return trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({
        id: attendanceId,
      })
      utils.event.attendance.getAttendee.invalidate({
        attendanceId,
        userId: user.id,
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })
}

interface RegisterProps {
  attendanceId: string
  user: Session["user"]
}
export const useRegisterMutation = ({ attendanceId, user }: RegisterProps) => {
  const utils = trpc.useUtils()

  const mutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({ id: attendanceId || "" })
      utils.event.attendance.getAttendee.invalidate({
        attendanceId,
        userId: user.id,
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return mutation
}
