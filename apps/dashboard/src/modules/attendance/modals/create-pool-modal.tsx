import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { usePoolsGetQuery } from "../queries/use-get-queries"
import { useCreatePoolMutation } from "../mutations/use-pool-mutations"

interface CreatePoolModalProps {
  attendanceId: string
}
export const CreatePoolModal: FC<ContextModalProps<CreatePoolModalProps>> = ({ context, id, innerProps }) => {
  const { mutate: createPool } = useCreatePoolMutation()
  const { pools } = usePoolsGetQuery(innerProps.attendanceId)
  const onClose = () => context.closeModal(id)
  const onSubmit = (values: PoolFormSchema) => {
    createPool({
      capacity: values.capacity,
      yearCriteria: values.yearCriteria,
      attendanceId: innerProps.attendanceId,
      title: values.title,
      isVisible: values.isVisible,
      type: "NORMAL",
    })
  }

  const disabledYears = [...new Set(pools.filter((pool) => pool.isVisible).flatMap(({ yearCriteria }) => yearCriteria))]

  return pools ? (
    <PoolForm
      defaultValues={{
        yearCriteria: [],
        capacity: 0,
        title: "",
        isVisible: true,
      }}
      onClose={onClose}
      mode="create"
      onSubmit={onSubmit}
      disabledYears={disabledYears}
    />
  ) : null
}

export const openCreatePoolModal =
  ({ attendanceId }: CreatePoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/create",
      title: "Ny påmeldingsgruppe",
      innerProps: {
        attendanceId,
      },
    })
