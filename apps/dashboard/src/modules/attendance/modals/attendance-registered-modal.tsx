import type { User } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"

interface AttendanceRegisteredModalProps {
  user: User
}

export const AttendanceRegisteredModal: FC<ContextModalProps<AttendanceRegisteredModalProps>> = ({
  context,
  id,
  innerProps,
}) => {
  return (
    <div className="w-full">
      <h1>{innerProps.user.name}</h1>
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
