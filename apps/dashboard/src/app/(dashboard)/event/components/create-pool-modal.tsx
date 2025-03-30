import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreatePoolMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"
import { PoolForm, type PoolFormSchema } from "./pool-form"

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
      isVisible: values.isVisible,
      type: "NORMAL",
    })
  }
  const pools = attendance?.pools

  const disabledYears = pools
    ? [...new Set(pools.filter((pool) => pool.isVisible).flatMap(({ yearCriteria }) => yearCriteria))]
    : []

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
