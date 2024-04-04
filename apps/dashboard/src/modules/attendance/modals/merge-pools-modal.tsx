import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { usePoolsGetQuery } from "../queries/use-get-queries"
import { useCreatePoolMutation } from "../mutations/use-pool-mutations"
import { useMergeAttendanceMutation } from "../mutations/use-attendance-mutations"

interface MergePoolsModalProps {
  attendanceId: string
}
export const MergePoolsModal: FC<ContextModalProps<MergePoolsModalProps>> = ({ context, id, innerProps }) => {
  const { pools } = usePoolsGetQuery(innerProps.attendanceId)
  const onClose = () => context.closeModal(id)
  const mergeAttendanceMut = useMergeAttendanceMutation()

  const onSubmit = (values: PoolFormSchema) => {
    mergeAttendanceMut.mutate({
      title: "Generell påmelding",
      yearCriteria: values.yearCriteria,
      attendanceId: innerProps.attendanceId,
    })
  }

  const disabledYears = [...new Set(pools.filter((pool) => pool.active).flatMap(({ yearCriteria }) => yearCriteria))]

  return (
    <PoolForm
      defaultValues={{
        yearCriteria: disabledYears,
        capacity: 0,
        title: "Generell påmelding",
      }}
      onClose={onClose}
      mode="create"
      onSubmit={onSubmit}
      disabledYears={disabledYears}
    />
  )
}

export const openMergePoolsModal =
  ({ attendanceId }: MergePoolsModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/merge",
      title: "Merge",
      innerProps: {
        attendanceId,
      },
    })
