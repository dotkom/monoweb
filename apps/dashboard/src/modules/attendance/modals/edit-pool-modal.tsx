import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { usePoolsGetQuery } from "../queries/use-get-queries"
import { useUpdatePoolMutation } from "../mutations/use-pool-mutations"
import { UpdatePoolForm, UpdatePoolFormSchema } from "../components/PoolForm/UpdatePoolForm"

interface EditPoolModalProps {
  poolId: string
  attendanceId: string
  defaultValues: UpdatePoolFormSchema
}
export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({ context, id, innerProps }) => {
  const { pools } = usePoolsGetQuery(innerProps.attendanceId)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const onSubmit = (values: UpdatePoolFormSchema) => {
    context.closeModal(id)
    updatePool({
      input: {
        limit: values.limit,
      },
      id: innerProps.poolId,
    })
  }

  const onClose = () => context.closeModal(id)
  return pools ? (
    <UpdatePoolForm
      defaultValues={innerProps.defaultValues}
      onClose={onClose}
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
