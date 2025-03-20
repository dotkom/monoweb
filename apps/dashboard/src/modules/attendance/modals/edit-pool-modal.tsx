import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { PoolForm } from "../components/PoolForm/PoolForm"
import { useUpdatePoolMutation } from "../mutations/use-pool-mutations"
import { useAttendanceGetQuery } from "../queries/use-get-queries"

interface EditPoolModalProps {
  poolId: string
  attendanceId: string
  defaultValues: PoolForm
}

export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId, poolId, defaultValues },
}) => {
  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const disabledYears = attendance ? [...new Set(attendance.pools.flatMap(({ yearCriteria }) => yearCriteria))] : []

  const onSubmit = (input: PoolForm) => {
    context.closeModal(id)
    updatePool({ input, id: poolId })
  }

  const onClose = () => context.closeModal(id)
  return attendance ? (
    <PoolForm
      defaultValues={defaultValues}
      onClose={onClose}
      onSubmit={onSubmit}
      disabledYears={disabledYears}
      mode="update"
    />
  ) : null
}

export const openEditPoolModal =
  ({ attendanceId, defaultValues, poolId }: EditPoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/update",
      title: "Endre påmeldingsgruppe",
      innerProps: {
        attendanceId,
        defaultValues,
        poolId,
      },
    })
