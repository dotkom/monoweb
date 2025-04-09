import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useUpdatePoolMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"
import { PoolForm, type PoolFormSchema } from "./pool-form"

interface EditPoolModalProps {
  poolId: string
  attendanceId: string
  defaultValues: PoolFormSchema
}

export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId, poolId, defaultValues },
}) => {
  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const disabledYears = attendance ? [...new Set(attendance.pools.flatMap(({ yearCriteria }) => yearCriteria))] : []

  const onSubmit = (values: PoolFormSchema) => {
    context.closeModal(id)
    updatePool({
      input: {
        capacity: values.capacity,
        title: values.title,
        yearCriteria: values.yearCriteria,
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
