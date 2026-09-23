"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdatePoolMutation } from "../../../mutations"
import { useAttendanceGetQuery } from "../../../queries"
import { PoolForm, type PoolFormValues } from "./PoolForm"

interface EditPoolModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poolId: string
  attendanceId: string
  defaultValues: PoolFormValues
}

export function EditPoolModal({ open, onOpenChange, attendanceId, poolId, defaultValues }: EditPoolModalProps) {
  const { data: attendance } = useAttendanceGetQuery(attendanceId, open)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const disabledYears = attendance
    ? [...new Set(attendance.pools.filter((pool) => pool.id !== poolId).flatMap(({ yearCriteria }) => yearCriteria))]
    : []

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Endre påmeldingsgruppe</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && attendance && (
          <PoolForm
            defaultValues={{
              yearCriteria: defaultValues.yearCriteria,
              capacity: defaultValues.capacity,
              title: defaultValues.title,
              mergeDelayHours: defaultValues.mergeDelayHours,
            }}
            onClose={() => onOpenChange(false)}
            onSubmit={(values: PoolFormValues) => {
              updatePool({
                input: {
                  capacity: values.capacity,
                  title: values.title,
                  yearCriteria: values.yearCriteria,
                  mergeDelayHours: values.mergeDelayHours,
                },
                id: poolId,
              })
              onOpenChange(false)
            }}
            disabledYears={disabledYears}
            mode="update"
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
