import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { useUpdatePoolMutation } from "../mutations/use-pool-mutations"
import { useAttendanceGetQuery } from "../queries/use-get-queries"

interface EditPoolModalProps {
  poolId: string
  attendanceId: string
  defaultValues: PoolFormSchema
}

export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({ context, id, innerProps: { attendanceId, poolId, defaultValues } }) => {
  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const disabledYears = attendance ? [...new Set(attendance.pools.filter((pool) => pool.isVisible).flatMap(({ yearCriteria }) => yearCriteria))] : []

  const onSubmit = (values: PoolFormSchema) => {
    context.closeModal(id)
    updatePool({
      input: {
        capacity: values.capacity,
        title: values.title,
        yearCriteria: values.yearCriteria,
        isVisible: values.isVisible,
      },
      id: poolId,
    })
  }

  const onClose = () => context.closeModal(id)
  return attendance ? (
    <PoolForm
      defaultValues={{
        yearCriteria: defaultValues.yearCriteria,
        capacity: defaultValues.capacity,
        title: defaultValues.title,
        isVisible: defaultValues.isVisible,
      }}
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
        mode: "update",
        poolId,
      },
    })
