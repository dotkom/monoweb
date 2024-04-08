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
  const disabledYears = [...new Set(pools.filter((pool) => pool.isVisible).flatMap(({ yearCriteria }) => yearCriteria))]

  const onSubmit = (values: PoolFormSchema) => {
    context.closeModal(id)
    updatePool({
      input: {
        capacity: values.capacity,
        title: values.title,
        yearCriteria: values.yearCriteria,
        isVisible: values.isVisible,
      },
      id: innerProps.poolId,
    })
  }

  const onClose = () => context.closeModal(id)
  return pools ? (
    <PoolForm
      defaultValues={{
        yearCriteria: innerProps.defaultValues.yearCriteria,
        capacity: innerProps.defaultValues.capacity,
        title: innerProps.defaultValues.title,
        isVisible: innerProps.defaultValues.isVisible,
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
