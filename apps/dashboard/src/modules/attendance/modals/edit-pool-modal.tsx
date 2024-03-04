import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { usePoolsGetQuery } from "../queries/use-get-queries"
import { useUpdatePoolMutation } from "../mutations/use-pool-mutations"

interface EditPoolModalProps {
  poolId: string
  attendanceId: string
  defaultValues: PoolFormSchema
}
export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({ context, id, innerProps }) => {
  const { pools } = usePoolsGetQuery(innerProps.attendanceId)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const onSubmit = (values: PoolFormSchema) => {
    context.closeModal(id)
    updatePool({
      input: {
        limit: values.limit,
        yearCriteria: values.yearCriteria,
      },
      id: innerProps.poolId,
    })
  }

  const onClose = () => context.closeModal(id)
  return pools ? (
    <PoolForm
      defaultValues={innerProps.defaultValues}
      onClose={onClose}
      mode="update"
      onSubmit={onSubmit}
      attendancePools={pools}
    />
  ) : null
}

export const openEditPoolModal =
  ({ attendanceId, defaultValues, poolId }: EditPoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/update",
      title: "Endre pulje",
      innerProps: {
        attendanceId,
        defaultValues,
        mode: "update",
        poolId,
      },
    })
