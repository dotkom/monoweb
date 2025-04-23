import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useMergeAttendanceMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"
import { PoolForm, type PoolFormSchema } from "./pool-form"

interface MergePoolsModalProps {
  attendanceId: string
}
export const MergePoolsModal: FC<ContextModalProps<MergePoolsModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId },
}) => {
  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const onClose = () => context.closeModal(id)
  const mergeAttendanceMut = useMergeAttendanceMutation()

  const onSubmit = (values: PoolFormSchema) => {
    mergeAttendanceMut.mutate({
      attendanceId: attendanceId,
    })
  }

  const enabledYears = attendance ? [...new Set(attendance.pools.flatMap(({ yearCriteria }) => yearCriteria))] : []

  return (
    <div>
      <details>
        <summary>Hva er sammenslåing?</summary>
        <ul>
          <li>Ventelisten for den nye gruppen bestemmes utifra påmeldingstidspunkt.</li>
          <li>Per nå lagres ikke informasjon om påmeldingsgruppene som ble slått sammen.</li>
          <li>Man kan legge til flere årskriterier for å begrense hvem som kan melde seg på.</li>
          <li>Det er ikke mulig å sette kapasitet til mindre enn summen av de gamle gruppene.</li>
        </ul>
      </details>
      <PoolForm
        defaultValues={{
          yearCriteria: enabledYears,
          capacity: attendance?.pools.reduce((acc, pool) => acc + pool.capacity, 0) ?? 0,
          title: "Generell påmelding",
        }}
        onClose={onClose}
        mode="create"
        onSubmit={onSubmit}
        enabledYears={enabledYears}
      />
    </div>
  )
}

export const openMergePoolsModal =
  ({ attendanceId }: MergePoolsModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/merge",
      title: "Sammenslåing",
      innerProps: {
        attendanceId,
      },
    })
