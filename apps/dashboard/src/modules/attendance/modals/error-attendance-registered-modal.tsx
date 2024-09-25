import type { User } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"

interface AttendanceRegisteredModalProps {
  user: User
}

export const AlreadyAttendedModal: FC<ContextModalProps<AttendanceRegisteredModalProps>> = ({ innerProps }) => {
  return (
    <div className="w-full">
      <h1>Bruker allerede påmeldt</h1>
      <h2 className="text-">{`${innerProps.user.profile?.firstName} ${innerProps.user.profile?.lastName}`}</h2>
      <p>{innerProps.user.email}</p>
    </div>
  )
}

export const openAlreadyAttendedModal =
  ({ user }: AttendanceRegisteredModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/registered-error",
      title: "Bruker Allerede påmeldt",
      innerProps: {
        user,
      },
    })
