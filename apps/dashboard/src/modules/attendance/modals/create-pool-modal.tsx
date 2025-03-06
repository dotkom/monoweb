import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { useCreatePoolMutation } from "../mutations/use-pool-mutations"
import { useAttendanceGetQuery } from "../queries/use-get-queries"

interface CreatePoolModalProps {
  attendanceId: string
}
export const CreatePoolModal: FC<ContextModalProps<CreatePoolModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId },
}) => {
  const { mutate: createPool } = useCreatePoolMutation()
  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const onClose = () => context.closeModal(id)
  const onSubmit = (values: PoolFormSchema) => {
    createPool({
      capacity: values.capacity,
      yearCriteria: values.yearCriteria,
      attendanceId: attendanceId,
      title: values.title,
      mergeDelayHours: null,
    })
  }
  const pools = attendance?.pools

  const disabledYears = pools ? [...new Set(pools.flatMap(({ yearCriteria }) => yearCriteria))] : []

  return pools ? (
    <PoolForm
      defaultValues={{
        yearCriteria: [],
        capacity: 0,
        title: "",
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
