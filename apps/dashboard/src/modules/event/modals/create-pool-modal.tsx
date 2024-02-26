import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { PoolForm } from "../components/PoolForm/PoolForm2"

interface PoolModalProps {
  attendanceId: string
  defaultValues?: {
    limit: number
    yearCriteria: number[]
  }
  update?: boolean
}

export const PoolModal: FC<ContextModalProps<PoolModalProps>> = ({ context, id, innerProps }) => {
  const onClose = () => context.closeModal(id)
  return (
    <PoolForm
      defaultValues={innerProps.defaultValues}
      onClose={onClose}
      attendanceId={innerProps.attendanceId}
      update={innerProps.update}
    />
  )
}

// TODO: this does not follow convention
export const openCreatePoolModal =
  ({ attendanceId }: PoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool",
      title: "Ny pulje",
      innerProps: {
        attendanceId,
      },
    })

export const openEditPoolModal =
  ({ attendanceId, defaultValues }: PoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool",
      title: "Endre pulje",
      innerProps: {
        attendanceId,
        defaultValues,
        update: true,
      },
    })
