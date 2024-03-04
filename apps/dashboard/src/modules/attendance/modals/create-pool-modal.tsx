import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { CreatePoolForm, type CreatePoolFormSchema } from "../components/PoolForm/CreatePoolForm"
import { usePoolsGetQuery } from "../queries/use-get-queries"
import { useCreatePoolMutation } from "../mutations/use-pool-mutations"

interface CreatePoolModalProps {
  attendanceId: string
}
export const CreatePoolModal: FC<ContextModalProps<CreatePoolModalProps>> = ({ context, id, innerProps }) => {
  const { mutate: createPool } = useCreatePoolMutation()
  const { pools } = usePoolsGetQuery(innerProps.attendanceId)
  const onClose = () => context.closeModal(id)
  const onSubmit = (values: CreatePoolFormSchema) => {
    createPool({
      limit: values.limit,
      yearCriteria: values.yearCriteria,
      attendanceId: innerProps.attendanceId,
    })
  }
  return pools ? (
    <CreatePoolForm
      defaultValues={{
        yearCriteria: [],
        limit: 0,
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
      title: "Ny pulje",
      innerProps: {
        attendanceId,
      },
    })
