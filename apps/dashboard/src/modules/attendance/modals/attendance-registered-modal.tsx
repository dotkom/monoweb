import type { User } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"

interface AttendanceRegisteredModalProps {
  user: User
}

export const AttendanceRegisteredModal: FC<ContextModalProps<AttendanceRegisteredModalProps>> = ({
  id,
  innerProps,
}) => {
  setTimeout(() => {
    modals.close(id)
  }, 3000)
  return (
    <div className="w-full">
      <h1>{`${innerProps.user.profile?.firstName} ${innerProps.user.profile?.lastName}`}</h1>
      <p>{innerProps.user.email}</p>
    </div>
  )
}

export const openAttendanceRegisteredModal =
  ({ user }: AttendanceRegisteredModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/registered",
      title: "Bruker påmeldt",
      innerProps: {
        user,
      },
    })
