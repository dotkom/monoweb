import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm"
import { useMergeAttendanceMutation } from "../mutations/use-attendance-mutations"
import { usePoolsGetQuery } from "../queries/use-get-queries"

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

  const disabledYears = [...new Set(pools.filter((pool) => pool.isVisible).flatMap(({ yearCriteria }) => yearCriteria))]

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
          yearCriteria: disabledYears,
          capacity: pools.reduce((acc, pool) => acc + pool.capacity, 0),
          title: "Generell påmelding",
          isVisible: true,
        }}
        onClose={onClose}
        mode="create"
        onSubmit={onSubmit}
        disabledYears={disabledYears}
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
