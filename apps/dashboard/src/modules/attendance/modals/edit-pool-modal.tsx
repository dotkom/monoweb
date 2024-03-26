import { type ContextModalProps, modals } from "@mantine/modals"
import { type FC } from "react"
import { PoolForm, PoolFormSchema } from "../components/PoolForm/PoolForm"
import { useUpdatePoolMutation } from "../mutations/use-pool-mutations"
import { usePoolsGetQuery } from "../queries/use-get-queries"

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
        title: values.title,
        yearCriteria: values.yearCriteria,
      },
      id: innerProps.poolId,
    })
  }

  const onClose = () => context.closeModal(id)
  return pools ? (
    <PoolForm
      defaultValues={{
        yearCriteria: innerProps.defaultValues.yearCriteria,
        limit: innerProps.defaultValues.limit,
        title: innerProps.defaultValues.title,
      }}
      onClose={onClose}
      onSubmit={onSubmit}
      attendancePools={pools?.filter((pool) => pool.id !== innerProps.poolId)}
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
