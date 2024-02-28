import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { notifyComplete } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { useEventAttendanceGetQuery } from "../queries/use-event-attendance-get-query"

interface CreatePoolModalProps {
  attendanceId: string
}
export const CreatePoolModal: FC<ContextModalProps<CreatePoolModalProps>> = ({ context, id, innerProps }) => {
  const { mutate: createPool } = trpc.event.attendance.createPool.useMutation({
    onSuccess: () => {
      notifyComplete({
        title: "Pulje opprettet",
        message: "Puljen er opprettet",
      })
    },
  })
  const { pools } = useEventAttendanceGetQuery(innerProps.attendanceId)
  const onClose = () => context.closeModal(id)
  const onSubmit = (values: PoolFormSchema) => {
    createPool({
      limit: values.limit,
      yearCriteria: values.yearCriteria,
      attendanceId: innerProps.attendanceId,
    })
  }
  return pools ? (
    <PoolForm
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

// TODO: this does not follow convention
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
