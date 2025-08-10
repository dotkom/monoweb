import type { AttendanceId } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreatePoolMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"
import { PoolForm, type PoolFormSchema } from "./pool-form"

interface CreatePoolModalProps {
  attendanceId: AttendanceId
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
      id: attendanceId,

      input: {
        capacity: values.capacity,
        yearCriteria: values.yearCriteria,
        title: values.title,
        mergeDelayHours: null,
      },
    })

    context.closeModal(id)
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
