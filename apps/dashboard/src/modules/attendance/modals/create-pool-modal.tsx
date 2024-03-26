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
      limit: values.limit,
      yearCriteria: values.yearCriteria,
      attendanceId: innerProps.attendanceId,
      title: values.title,
    })
  }
  return pools ? (
    <PoolForm
      defaultValues={{
        yearCriteria: [],
        limit: 0,
        title: "",
      }}
      onClose={onClose}
      mode="create"
      onSubmit={onSubmit}
      attendancePools={pools}
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
